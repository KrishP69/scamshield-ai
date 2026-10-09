import asyncio
import uuid
from typing import Any, Dict, Optional
import numpy as np
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


@router.post("/ai-image")
async def scan_ai_image(
    request: Request,
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    preset: Optional[str] = Form(None),
) -> Dict[str, Any]:
    """
    State-of-the-art forensic analysis to detect AI-generated images, deepfakes, and synthetic fraud.
    Uses 2D Fast Fourier Transform (FFT) spectrum residual analysis,
    Error Level Analysis (ELA) compression gradients, and Laplacian PRNU sensor noise evaluation.
    """
    await check_rate_limit(request)
    from app.modules.ai_image_detector import detect_ai_generated_image
    import base64
    import io
    from PIL import Image, ImageDraw, ImageFilter

    image_bytes = None
    filename = "uploaded_image.png"

    if file:
        image_bytes = await file.read()
        filename = file.filename or filename
    elif image_base64:
        # Strip data uri prefix if present
        b64_clean = image_base64
        if "base64," in b64_clean:
            b64_clean = b64_clean.split("base64,")[1]
        try:
            image_bytes = base64.b64decode(b64_clean)
            filename = "pasted_image.png"
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")
    elif preset:
        # Generate representative forensic sample based on preset
        if preset == "midjourney_profile":
            # Synthetic pattern with characteristic high-frequency grid lattice
            w, h = 512, 512
            arr = np.zeros((h, w, 3), dtype=np.uint8)
            y, x = np.mgrid[:h, :w]
            # Synthetic radial face gradients
            grad = np.clip(180 - np.sqrt((x-256)**2 + (y-256)**2) * 0.6, 20, 240).astype(np.uint8)
            arr[:, :, 0] = grad
            arr[:, :, 1] = np.clip(grad * 0.85 + 15, 0, 255).astype(np.uint8)
            arr[:, :, 2] = np.clip(grad * 0.75 + 30, 0, 255).astype(np.uint8)
            # Characteristic diffusion periodic lattice artifact (16-pixel stride)
            lattice = ((x % 16 == 0) | (y % 16 == 0)).astype(np.uint8) * 22
            arr[:, :, 0] = np.clip(arr[:, :, 0] + lattice, 0, 255)
            arr[:, :, 1] = np.clip(arr[:, :, 1] + lattice, 0, 255)
            buf = io.BytesIO()
            Image.fromarray(arr).save(buf, format="JPEG", quality=92)
            image_bytes = buf.getvalue()
            filename = "midjourney_deepfake_profile.jpg"
        elif preset == "dalle_payment_proof":
            # Synthetic payment screenshot with high compression inconsistency
            img = Image.new("RGB", (512, 512), color=(240, 242, 248))
            draw = ImageDraw.Draw(img)
            draw.rectangle([40, 40, 472, 472], fill=(255, 255, 255), outline=(200, 205, 220))
            draw.rectangle([60, 60, 452, 160], fill=(47, 69, 255))
            draw.text((80, 80), "TELEGRAM CRYPTO AIRDROP CONFIRMATION", fill=(255, 255, 255))
            draw.text((80, 110), "+500.00 USDT TRANSFERRED TO WALLET", fill=(255, 255, 255))
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=90)
            image_bytes = buf.getvalue()
            filename = "dalle_fake_payment_screenshot.jpg"
        elif preset == "authentic_camera":
            # Natural camera image simulation: organic scene gradients with optical decay and sensor noise
            w, h = 512, 512
            y, x = np.mgrid[:h, :w]
            # Natural landscape luminosity gradient (smooth 1/f decay)
            scene = np.sin(x / 45.0) * 40.0 + np.cos(y / 55.0) * 35.0 + (y * 0.25) + 110.0
            img_scene = Image.fromarray(np.clip(scene, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=2.5))
            scene_arr = np.array(img_scene, dtype=np.float32)
            noise = np.random.normal(0, 1.8, (h, w)).astype(np.float32)
            arr = np.zeros((h, w, 3), dtype=np.uint8)
            arr[:, :, 0] = np.clip(scene_arr + noise, 0, 255).astype(np.uint8)
            arr[:, :, 1] = np.clip(scene_arr * 0.92 + noise, 0, 255).astype(np.uint8)
            arr[:, :, 2] = np.clip(scene_arr * 0.85 + noise, 0, 255).astype(np.uint8)
            buf = io.BytesIO()
            Image.fromarray(arr).save(buf, format="JPEG", quality=95)
            image_bytes = buf.getvalue()
            filename = "authentic_camera_photo.jpg"

    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image provided. Please upload an image file or select a preset.",
        )

    result = detect_ai_generated_image(image_bytes, filename=filename)
    return result
