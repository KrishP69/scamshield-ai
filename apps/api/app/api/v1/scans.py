import asyncio
import uuid
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from app.core.rate_limit import check_rate_limit
from app.orchestrator.engine import orchestrator
from app.orchestrator.events import event_broadcaster
from app.schemas.common import PlatformType
from app.schemas.passport import TrustPassport
from app.schemas.scan import QuickScanRequest, QuickScanResponse, ScanCreateRequest, ScanResponse

router = APIRouter(prefix="/scans", tags=["Scans & Detection"])

_scan_store = {}


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
