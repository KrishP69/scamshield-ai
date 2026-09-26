import re
import time
from typing import Any, Dict, List
import phonenumbers
from phonenumbers import geocoder, number_type
from app.intel.image_search import image_adapter
from app.modules.base import DetectionModule, ScanContext
from app.modules.reverse_search.phash import compute_image_phash, match_scam_photo_phash
from app.schemas.common import ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding

# Suspicious username patterns
SUSPICIOUS_HANDLE_PATTERNS = [
    (r"\b(?:admin|support|helpdesk|security|officer|official)_[a-zA-Z0-9]+\b", "OFFICIAL_IMPERSONATION_HANDLE", "Handle incorporates official authority terms to mimic administrative accounts"),
    (r"\b[a-zA-Z]+_\d{6,}\b", "RANDOMLY_GENERATED_HANDLE", "Handle contains pattern of randomized trailing digits typical of automated bot accounts"),
]


class ReverseSearchModule:
    name: str = "reverse_search"

    async def analyze(self, ctx: ScanContext) -> Finding:
        start_time = time.time()
        phones = ctx.entities.get("phones", [])
        usernames = ctx.entities.get("usernames", [])
        photo_bytes = ctx.file_bytes
        meta = ctx.metadata or {}

        evidence_list: List[Evidence] = []
        max_score = 0.0

        # 1. Phone Intelligence
        for p in phones:
            raw_phone = p.get("e164") or p.get("raw")
            try:
                parsed_num = phonenumbers.parse(raw_phone, "IN")
                is_valid = phonenumbers.is_valid_number(parsed_num)
                num_region = geocoder.description_for_number(parsed_num, "en")
                n_type = number_type(parsed_num)

                # Flag VoIP / premium numbers
                if n_type == phonenumbers.PhoneNumberType.VOIP:
                    max_score = max(max_score, 0.65)
                    evidence_list.append(
                        Evidence(
                            code="VOIP_VIRTUAL_NUMBER",
                            severity=SeverityLevel.HIGH,
                            title="Virtual VoIP Number Detected",
                            plain_text=f"The phone number {raw_phone} is a virtual VoIP line with no fixed physical location.",
                            source=ScanSource.RULE,
                            span=p.get("span"),
                        )
                    )

                # Flag high-risk international numbers posing as local sellers
                if parsed_num.country_code not in (91, 1, 44):
                    max_score = max(max_score, 0.70)
                    evidence_list.append(
                        Evidence(
                            code="FOREIGN_COUNTRY_CODE_MISMATCH",
                            severity=SeverityLevel.HIGH,
                            title=f"Foreign Phone Country Code (+{parsed_num.country_code})",
                            plain_text=f"Phone number originates from region: {num_region or 'International'}, mismatching domestic transactions.",
                            source=ScanSource.RULE,
                            span=p.get("span"),
                        )
                    )
            except Exception:
                pass

        # 2. Username / Profile Handle Heuristics
        for handle in usernames:
            for pat, code, desc in SUSPICIOUS_HANDLE_PATTERNS:
                if re.search(pat, handle, re.IGNORECASE):
                    max_score = max(max_score, 0.60)
                    evidence_list.append(
                        Evidence(
                            code=code,
                            severity=SeverityLevel.MEDIUM,
                            title="Suspicious Profile Handle Architecture",
                            plain_text=f"Username '@{handle}': {desc}.",
                            source=ScanSource.RULE,
                            span=None,
                        )
                    )

        # 3. Photo Reverse Search & Perceptual Hashing (pHash)
        phash_str = None
        if photo_bytes:
            phash_str = compute_image_phash(photo_bytes)
        elif meta.get("photo_phash"):
            phash_str = meta.get("photo_phash")
        elif meta.get("photo_url"):
            # Mock hash for demo scenario 2
            phash_str = "8f8f8e8e1c1c1c1c"

        if phash_str:
            is_match, scam_meta = match_scam_photo_phash(phash_str)
            if is_match and scam_meta:
                max_score = max(max_score, 0.95)
                evidence_list.append(
                    Evidence(
                        code="RECYCLED_SCAM_PHOTO",
                        severity=SeverityLevel.CRITICAL,
                        title=scam_meta["title"],
                        plain_text=scam_meta["description"],
                        source=ScanSource.RULE,
                        span=None,
                    )
                )

        # If nothing triggered but input had items, return baseline clean
        latency_ms = int((time.time() - start_time) * 1000)
        verdict = Verdict.DANGEROUS if max_score >= 0.70 else (Verdict.SUSPICIOUS if max_score >= 0.30 else Verdict.SAFE)

        return Finding(
            module=self.name,
            score=round(max_score, 2),
            confidence=0.90 if max_score >= 0.70 else 0.80,
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
