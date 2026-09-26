import asyncio
import time
from typing import Any, Dict, List, Optional
from app.core.logging import logger
from app.modules.base import DetectionModule, ScanContext
from app.modules.scam_guardian.guardian import scam_guardian
from app.orchestrator.events import event_broadcaster
from app.preprocess.clean import clean_text
from app.preprocess.entities import extract_all_entities
from app.preprocess.lang import detect_language
from app.preprocess.ocr import extract_text_from_image
from app.schemas.common import PlatformType
from app.schemas.finding import Finding
from app.schemas.passport import TrustPassport
from app.scoring.passport import build_trust_passport


class ScanOrchestrator:
    """Coordinates input preprocessing, parallel module fan-out, SSE streaming, and scoring fusion."""

    def __init__(self):
        # Active modules in Phase 1 (additional modules register in Phase 2)
        self.modules: List[DetectionModule] = [scam_guardian]

    async def execute_scan(
        self,
        scan_id: str,
        text: Optional[str] = None,
        platform: PlatformType = PlatformType.UNKNOWN,
        file_bytes: Optional[bytes] = None,
        file_name: Optional[str] = None,
        file_mime: Optional[str] = None,
        target_lang: str = "en",
    ) -> TrustPassport:
        """Executes full scan pipeline and streams partial progress over SSE."""
        start_time = time.time()
        logger.info(f"Starting scan orchestration for {scan_id} on {platform}")

        # 1. Preprocessing stage
        await event_broadcaster.emit(scan_id, {
            "stage": "preprocess",
            "status": "started",
            "message": "Analyzing input text, running OCR (if image), and detecting language...",
        })

        raw_text = text or ""
        # If an image file is uploaded and text is empty, run OCR
        if file_bytes and (not file_name or file_name.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))):
            ocr_result = extract_text_from_image(file_bytes)
            if ocr_result.get("text"):
                raw_text = ocr_result["text"]
                logger.info(f"OCR extracted {len(raw_text)} characters for scan {scan_id}")

        cleaned, obfuscation_flags = clean_text(raw_text)
        lang_info = detect_language(cleaned)
        entities = extract_all_entities(cleaned)

        ctx = ScanContext(
            scan_id=scan_id,
            raw_text=raw_text,
            cleaned_text=cleaned,
            platform=platform,
            entities=entities,
            language_info=lang_info,
            file_bytes=file_bytes,
            file_name=file_name,
            file_mime=file_mime,
            metadata={"obfuscation_flags": obfuscation_flags},
        )

        await event_broadcaster.emit(scan_id, {
            "stage": "preprocess",
            "status": "completed",
            "language": lang_info.get("language"),
            "extracted_entities": {
                "urls": len(entities.get("urls", [])),
                "phones": len(entities.get("phones", [])),
                "wallets": len(entities.get("wallets", [])),
            },
        })

        # 2. Async Parallel Fan-Out to detection modules
        findings: List[Finding] = []

        async def run_module(module: DetectionModule) -> Optional[Finding]:
            try:
                await event_broadcaster.emit(scan_id, {
                    "module": module.name,
                    "status": "running",
                })
                finding = await module.analyze(ctx)
                await event_broadcaster.emit(scan_id, {
                    "module": module.name,
                    "status": "done",
                    "score": finding.score,
                    "confidence": finding.confidence,
                    "verdict": finding.verdict,
                    "evidence_count": len(finding.evidence),
                })
                return finding
            except Exception as e:
                logger.error(f"Module {module.name} failed during scan {scan_id}: {str(e)}")
                await event_broadcaster.emit(scan_id, {
                    "module": module.name,
                    "status": "failed",
                    "error": str(e),
                })
                return None

        tasks = [run_module(m) for m in self.modules]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for res in results:
            if isinstance(res, Finding):
                findings.append(res)

        # 3. Decision & Fusion stage
        await event_broadcaster.emit(scan_id, {
            "stage": "scoring",
            "status": "started",
            "message": "Fusing evidence compounding and synthesizing bilingual reasons...",
        })

        passport = build_trust_passport(
            scan_id=scan_id,
            findings=findings,
            context=ctx,
            target_lang=target_lang,
        )

        total_latency = int((time.time() - start_time) * 1000)
        logger.info(f"Scan {scan_id} completed with risk score {passport.risk_score} in {total_latency}ms")

        # 4. Emit final completion event for SSE stream
        await event_broadcaster.emit(scan_id, {
            "event": "complete",
            "scan_id": scan_id,
            "risk_score": passport.risk_score,
            "level": passport.level,
            "passport": passport.model_dump(),
        })

        return passport


orchestrator = ScanOrchestrator()
