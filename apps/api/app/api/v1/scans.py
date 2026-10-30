import asyncio
import uuid
from typing import Any, Dict, Optional
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from app.core.rate_limit import check_rate_limit
from app.orchestrator.engine import orchestrator
from app.orchestrator.events import event_broadcaster
from app.schemas.common import PlatformType
from app.schemas.passport import TrustPassport
from app.schemas.scan import QuickScanRequest, QuickScanResponse, ScanCreateRequest, ScanResponse

router = APIRouter(prefix="/scans", tags=["Scans & Detection"])

import collections

# Bounded in-memory scan store (max 2,000 items) with LRU eviction to prevent memory leaks
class BoundedDict(collections.OrderedDict):
    def __init__(self, maxsize=2000, *args, **kwargs):
        self.maxsize = maxsize
        super().__init__(*args, **kwargs)

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        if len(self) > self.maxsize:
            self.popitem(last=False)

_scan_store = BoundedDict(maxsize=2000)


@router.post("", response_model=ScanResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_scan(
    request: Request,
    payload: Optional[ScanCreateRequest] = None,
    file: Optional[UploadFile] = File(None),
    text_form: Optional[str] = Form(None),
    platform_form: Optional[str] = Form(None),
    lang: Optional[str] = "en",
) -> ScanResponse:
    """
    Submits a message, link, phone, or file for multi-module scan analysis.
    Executes async parallel detection, computes explainable risk scoring, and returns Trust Passport.
    """
    await check_rate_limit(request)

    scan_id = str(uuid.uuid4())
    submitted_text = ""
    platform_val = PlatformType.UNKNOWN
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        try:
            body = await request.json()
            submitted_text = body.get("text") or body.get("content") or body.get("url") or ""
            p_str = body.get("platform")
            if p_str:
                try:
                    platform_val = PlatformType(p_str)
                except ValueError:
                    platform_val = PlatformType.UNKNOWN
        except Exception:
            pass
    elif payload and (payload.text or payload.url):
        submitted_text = payload.text or payload.url or ""
        platform_val = payload.platform or PlatformType.UNKNOWN
    else:
        submitted_text = text_form or ""
        if platform_form:
            try:
                platform_val = PlatformType(platform_form)
            except ValueError:
                platform_val = PlatformType.UNKNOWN

    file_bytes = None
    file_name = None
    file_mime = None
    if file:
        file_bytes = await file.read()
        file_name = file.filename
        file_mime = file.content_type

    # Execute orchestrator pipeline
    passport = await orchestrator.execute_scan(
        scan_id=scan_id,
        text=submitted_text,
        platform=platform_val,
        file_bytes=file_bytes,
        file_name=file_name,
        file_mime=file_mime,
        target_lang=lang or "en",
    )

    _scan_store[scan_id] = {
        "id": scan_id,
        "text": submitted_text,
        "platform": platform_val,
        "status": "completed",
        "passport": passport,
    }

    return ScanResponse(scan_id=scan_id, status="completed", passport=passport)


@router.get("/{scan_id}", response_model=TrustPassport)
async def get_scan_report(scan_id: str) -> TrustPassport:
    """Retrieves the full Trust Passport for a completed scan."""
    if scan_id not in _scan_store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    return _scan_store[scan_id]["passport"]


@router.get("/{scan_id}/stream")
async def stream_scan_events(scan_id: str) -> StreamingResponse:
    """
    Server-Sent Events (SSE) endpoint providing real-time streaming of module progress
    and partial findings as they complete.
    """
    # If scan is already completed, emit immediate replay of the final passport event
    if scan_id in _scan_store:
        async def replay_generator():
            passport = _scan_store[scan_id]["passport"]
            import json
            yield f"data: {json.dumps({'stage': 'complete', 'status': 'completed', 'risk_score': passport.risk_score, 'level': passport.level, 'passport': passport.model_dump()})}\n\n"

        return StreamingResponse(replay_generator(), media_type="text/event-stream")

    return StreamingResponse(
        event_broadcaster.event_generator(scan_id),
        media_type="text/event-stream",
    )


@router.post("/quick", response_model=QuickScanResponse)
async def quick_scan(payload: QuickScanRequest) -> QuickScanResponse:
    """Lightweight endpoint for browser extension and Android background shield."""
    flagged = False
    reasons = []

    if payload.text_snippet:
        lowered = payload.text_snippet.lower()
        if "seed phrase" in lowered or "private key" in lowered:
            flagged = True
            reasons.append("Request for private credentials / seed phrase")
        if "guaranteed 3x" in lowered or "send eth" in lowered:
            flagged = True
            reasons.append("Guaranteed return investment trap")
        if "gate pass" in lowered or "advance deposit" in lowered:
            flagged = True
            reasons.append("Advance payment demand")

    return QuickScanResponse(
        is_flagged=flagged,
        risk_hint="Potential threat detected" if flagged else "Clean",
        reasons=reasons,
    )


async def fetch_remote_image_safely(url_str: str, max_bytes: int = 10 * 1024 * 1024) -> Optional[bytes]:
    """
    Safely downloads a remote image while strictly defending against SSRF, internal network probes,
    cloud metadata exfiltration, circular redirects, and OOM denial of service.
    """
    from urllib.parse import urlparse
    import httpx
    from app.modules.link_scanner.ssrf import detect_ssrf_and_ip_host
    from app.core.logging import logger

    current_url = url_str.strip()
    parsed = urlparse(current_url)
    if parsed.scheme.lower() not in ("http", "https"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL scheme. Only HTTP and HTTPS URLs are permitted.",
        )

    async with httpx.AsyncClient(timeout=6.0, follow_redirects=False) as client:
        for _ in range(4):
            parsed_hop = urlparse(current_url)
            hop_host = parsed_hop.hostname or ""
            ssrf_check = detect_ssrf_and_ip_host(hop_host)
            if ssrf_check["is_ssrf_risk"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Target URL blocked by SSRF & internal isolation guard: {ssrf_check.get('risk_description')}",
                )

            try:
                resp = await client.get(current_url)
            except httpx.RequestError as e:
                logger.warning(f"Failed fetching image from {current_url}: {e}")
                return None

            if resp.status_code in (301, 302, 303, 307, 308):
                location = resp.headers.get("Location")
                if not location:
                    return None
                from urllib.parse import urljoin
                location = urljoin(current_url, location)
                current_url = location
                continue

            if resp.status_code == 200:
                content_len = resp.headers.get("Content-Length")
                if content_len and int(content_len) > max_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Remote image exceeds maximum allowed size of 10MB.",
                    )
                content = resp.content
                if len(content) > max_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Remote image payload exceeded maximum allowed size of 10MB.",
                    )
                return content
            return None
    return None


@router.post("/screenshot-inspector")
async def scan_screenshot_banner(
    request: Request,
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    preset: Optional[str] = Form(None),
    text_hint: Optional[str] = Form(None),
) -> Dict[str, Any]:
    """
    Forensic analysis of suspicious screenshots, phishing posters, and absurd deal banners.
    Supports file upload, base64 data, preset archetypes, or direct screenshot image URL/link.
    """
    await check_rate_limit(request)
    from app.modules.screenshot_inspector import inspect_screenshot_banner
    import base64

    image_bytes = None
    filename = "uploaded_screenshot.png"

    if file:
        image_bytes = await file.read()
        filename = file.filename or filename
    elif image_base64:
        b64_clean = image_base64
        if "base64," in b64_clean:
            b64_clean = b64_clean.split("base64,")[1]
        try:
            image_bytes = base64.b64decode(b64_clean)
            filename = "pasted_screenshot.png"
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 screenshot data")
    elif image_url:
        image_url_str = image_url.strip()
        filename = image_url_str.split("/")[-1].split("?")[0] or "link_screenshot.png"
        image_bytes = await fetch_remote_image_safely(image_url_str)
        
        if not text_hint:
            text_hint = f"Screenshot URL: {image_url_str}"

    if image_url and not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve image from the provided URL. Please verify the URL or upload an image directly.",
        )

    if not image_bytes and not preset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No screenshot, URL, or preset provided. Please upload an image, enter a link, or choose a preset.",
        )

    result = inspect_screenshot_banner(
        image_bytes=image_bytes,
        text_hint=text_hint,
        filename=filename,
        preset=preset,
    )

    if image_url and not result.get("preview_image_url"):
        result["preview_image_url"] = image_url

    return result


