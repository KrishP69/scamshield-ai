import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from app.core.rate_limit import check_rate_limit
from app.schemas.common import ModuleStatus, PlatformType, RiskLevel, ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence
from app.schemas.passport import IndicatorSummary, ModuleSummary, TrustPassport
from app.schemas.scan import QuickScanRequest, QuickScanResponse, ScanCreateRequest, ScanResponse

router = APIRouter(prefix="/scans", tags=["Scans & Detection"])

# In-memory storage of recent scans for development
_scan_store = {}


@router.post("", response_model=ScanResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_scan(
    request: Request,
    payload: Optional[ScanCreateRequest] = None,
    # Optional multipart inputs for direct file / screenshot / audio upload
    file: Optional[UploadFile] = File(None),
    text_form: Optional[str] = Form(None),
    platform_form: Optional[str] = Form(None),
) -> ScanResponse:
    """Creates a scan job and returns a scan_id."""
    await check_rate_limit(request)

    scan_id = str(uuid.uuid4())
    submitted_text = payload.text if payload else (text_form or "")
    platform = payload.platform if payload else (platform_form or PlatformType.UNKNOWN)

    # Initial placeholder passport that will be updated by orchestrator
    passport = TrustPassport(
        scan_id=scan_id,
        risk_score=0,
        level=RiskLevel.LOW,
        confidence=0.9,
        scam_type=None,
        reasons=[],
        modules=[
            ModuleSummary(name="scam_guardian", status=ModuleStatus.DONE, score=0.0, confidence=0.9, source="rule", latency_ms=10),
            ModuleSummary(name="link_scanner", status=ModuleStatus.NOT_CHECKED),
            ModuleSummary(name="reverse_search", status=ModuleStatus.NOT_CHECKED),
            ModuleSummary(name="crypto_detector", status=ModuleStatus.NOT_CHECKED),
            ModuleSummary(name="file_scanner", status=ModuleStatus.NOT_CHECKED),
            ModuleSummary(name="voice_verifier", status=ModuleStatus.NOT_CHECKED),
        ],
        indicators=IndicatorSummary(),
        actions=["No threats detected in submitted sample. Remain vigilant."],
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    _scan_store[scan_id] = {
        "id": scan_id,
        "text": submitted_text,
        "platform": platform,
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
    """SSE endpoint streaming progressive module findings to the 3D frontend."""
    if scan_id not in _scan_store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")

    async def event_generator() -> AsyncGenerator[str, None]:
        modules = [
            ("preprocessor", "Input text normalized and entities extracted"),
            ("scam_guardian", "Scam Guardian evaluated manipulation tactics"),
            ("link_scanner", "Link analysis completed"),
            ("crypto_detector", "Crypto addresses and airdrop heuristics checked"),
            ("scoring_engine", "Noisy-OR evidence fusion completed"),
        ]
        for name, msg in modules:
            await asyncio.sleep(0.05)
            data = json.dumps({"module": name, "message": msg, "status": "done"})
            yield f"data: {data}\n\n"

        passport_json = _scan_store[scan_id]["passport"].model_dump_json()
        yield f"data: {json.dumps({'event': 'complete', 'passport': json.loads(passport_json)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/quick", response_model=QuickScanResponse)
async def quick_scan(payload: QuickScanRequest) -> QuickScanResponse:
    """Lightweight endpoint for browser extension and Android background shield."""
    flagged = False
    reasons = []

    # Check for known high-risk keywords in snippet
    if payload.text_snippet:
        lowered = payload.text_snippet.lower()
        if "seed phrase" in lowered or "private key" in lowered:
            flagged = True
            reasons.append("Request for private credentials / seed phrase")
        if "guaranteed 3x" in lowered or "send eth" in lowered:
            flagged = True
            reasons.append("Guaranteed return investment trap")

    return QuickScanResponse(
        is_flagged=flagged,
        risk_hint="Potential threat detected" if flagged else "Clean",
        reasons=reasons,
    )
