import re
import time
from typing import Any, Dict, List
from app.modules.base import DetectionModule, ScanContext
from app.modules.reverse_search.phash import compute_image_phash, match_scam_photo_phash
from app.schemas.common import ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding

SUSPICIOUS_HANDLE_PATTERNS = [
    (
        r"\b(?:admin|support|helpdesk|security|officer|official)_[a-zA-Z0-9_]+\b",
        "OFFICIAL_IMPERSONATION_HANDLE",
        "Handle incorporates official authority terms to mimic administrative accounts",
    ),
    (
        r"\b[a-zA-Z]+_\d{6,}\b",
        "RANDOMLY_GENERATED_HANDLE",
        "Handle contains pattern of randomized trailing digits typical of automated bot accounts",
    ),
]


class ReverseSearchModule(DetectionModule):
    name: str = "reverse_search"

    async def analyze(self, ctx: ScanContext) -> Finding:
        start_time = time.time()
        phones = ctx.entities.get("phones", []) if ctx.entities else []
        usernames = ctx.entities.get("usernames", []) if ctx.entities else []
        photo_bytes = ctx.file_bytes
        meta = ctx.metadata or {}

        evidence_list: List[Evidence] = []
        max_score = 0.0

        # 1. Phone number intelligence
        for p in phones:
            raw_phone = p.get("e164") or p.get("raw") if isinstance(p, dict) else str(p)
            try:
                import phonenumbers
                from phonenumbers import geocoder
                parsed_num = phonenumbers.parse(raw_phone, "IN")
                if phonenumbers.is_valid_number(parsed_num):
                    region = geocoder.description_for_number(parsed_num, "en")
            except Exception:
                pass

        # 2. Username analysis
        for u in usernames:
            handle = u if isinstance(u, str) else str(u)
            for pattern, code, desc in SUSPICIOUS_HANDLE_PATTERNS:
                if re.search(pattern, handle, re.IGNORECASE):
                    max_score = max(max_score, 0.70)
                    evidence_list.append(
                        Evidence(
                            code=code,
                            severity=SeverityLevel.HIGH,
                            title="Deceptive Account Handle Pattern",
                            plain_text=desc,
                            source=ScanSource.RULE,
                            span=None,
                        )
                    )

        # 3. Perceptual Hash match for profile photos
        phash_str = None
        if photo_bytes:
            phash_str = compute_image_phash(photo_bytes)
            if phash_str:
                is_scam, scam_meta = match_scam_photo_phash(phash_str)
                if is_scam and scam_meta:
                    max_score = max(max_score, 0.95)
                    evidence_list.append(
                        Evidence(
                            code="RECYCLED_SCAM_PHOTO",
                            severity=SeverityLevel.CRITICAL,
                            title=scam_meta.get("title", "Recycled Scam Photo"),
                            plain_text=scam_meta.get("description", "Image matches known fraudulent profile photo."),
                            source=ScanSource.RULE,
                            span=None,
                        )
                    )

        latency_ms = int((time.time() - start_time) * 1000)
        if max_score >= 0.70:
            verdict = Verdict.DANGEROUS
        elif max_score >= 0.30:
            verdict = Verdict.SUSPICIOUS
        else:
            verdict = Verdict.SAFE

        confidence = 0.90 if max_score >= 0.70 else 0.80

        return Finding(
            module=self.name,
            score=round(max_score, 2),
            confidence=confidence,
            verdict=verdict,
            evidence=evidence_list,
            indicators={
                "phones_checked": len(phones),
                "handles_checked": len(usernames),
                "photo_phash": phash_str,
            },
            source=ScanSource.RULE,
            latency_ms=latency_ms,
        )


reverse_search = ReverseSearchModule()
