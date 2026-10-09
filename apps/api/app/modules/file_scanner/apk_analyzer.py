"""
ScamShield AI - Android APK Security Profiler
Inspects Android packages, manifests, and dangerous permission bundles:
- Lethal OTP interception (RECEIVE_SMS + READ_SMS)
- Screen overlay & credential harvesting (SYSTEM_ALERT_WINDOW)
- Total device hijacking (BIND_ACCESSIBILITY_SERVICE)
- Disguised utility bill & loan harassment trojans
"""

import re
import time
from typing import Any, Dict, List, Optional
from app.modules.base import DetectionModule, ScanContext
from app.schemas.common import ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding

DANGEROUS_PERMISSIONS = {
    "android.permission.BIND_ACCESSIBILITY_SERVICE": {
        "title": "Accessibility Service Abuse (Trojan Hijack)",
        "severity": SeverityLevel.CRITICAL,
        "detail": "Can observe all on-screen interactions, capture passwords, and click buttons without user consent.",
        "weight": 0.95,
    },
    "android.permission.RECEIVE_SMS": {
        "title": "SMS Interception Capability",
        "severity": SeverityLevel.CRITICAL,
        "detail": "Allows app to silently read incoming bank OTPs and authentication codes.",
        "weight": 0.85,
    },
    "android.permission.READ_SMS": {
        "title": "SMS History Extraction",
        "severity": SeverityLevel.HIGH,
        "detail": "Grants full access to historical SMS messages, revealing transaction history and OTPs.",
        "weight": 0.75,
    },
    "android.permission.SYSTEM_ALERT_WINDOW": {
        "title": "Screen Overlay (Fake Phishing Forms)",
        "severity": SeverityLevel.HIGH,
        "detail": "Can draw deceptive fake login overlays on top of legitimate banking and social apps.",
        "weight": 0.80,
    },
    "android.permission.REQUEST_INSTALL_PACKAGES": {
        "title": "Silent Dropper / Secondary Malware Loader",
        "severity": SeverityLevel.HIGH,
        "detail": "Can download and install secondary malicious packages without Play Protect verification.",
        "weight": 0.75,
    },
    "android.permission.READ_CONTACTS": {
        "title": "Contact Book Harvesting (Loan Extortion)",
        "severity": SeverityLevel.HIGH,
        "detail": "Uploads contacts to extortion servers to blackmail victims under fraudulent instant loans.",
        "weight": 0.70,
    },
}

SUSPICIOUS_PACKAGE_PATTERNS = [
    (r"(?:electricity|bill|power|mahavitaran|bses|uppcl).*(?:update|pay|offic)", "Utility Bill Disconnection Trojan"),
    (r"(?:sbi|yono|hdfc|icici|axis|pnb|paytm|phonepe).*(?:kyc|update|reward)", "Banking Brand Phishing & Credential Stealer"),
    (r"(?:fast.*loan|instant.*cash|rupee.*credit|quick.*loan|easy.*borrow)", "Predatory Instant Loan Harassment App"),
    (r"(?:free.*diamond|mod.*menu|pubg.*hack|bgmi.*cheat|free.*fire.*skin)", "Mobile Game Credential & Account Hijack Injector"),
]


class APKProfiler(DetectionModule):
    name = "file_scanner"

    async def analyze(self, ctx: ScanContext) -> Finding:
        start_time = time.time()
        evidence_list: List[Evidence] = []
        indicators: Dict[str, Any] = {
            "permissions_analyzed": [],
            "flagged_permissions": [],
            "identified_trojan_profile": None,
        }

        # Inspect either raw uploaded file or text manifest payload
        manifest_text = ctx.raw_text or ctx.cleaned_text or ""
        file_name = (ctx.file_name or "").lower()

        is_apk = file_name.endswith(".apk") or "manifest" in manifest_text.lower() or "android.permission" in manifest_text

        if not is_apk and ctx.file_mime != "application/vnd.android.package-archive":
            # If not an APK context, return benign low score
            latency_ms = int((time.time() - start_time) * 1000)
            return Finding(
                module=self.name,
                score=0.0,
                confidence=0.5,
                verdict=Verdict.SAFE,
                evidence=[],
                indicators=indicators,
                source=ScanSource.RULE,
                latency_ms=latency_ms,
            )

        highest_score = 0.0

        # 1. Package Name & Filename Heuristic Check
        full_text_probe = f"{file_name} {manifest_text}"
        for pattern, trojan_label in SUSPICIOUS_PACKAGE_PATTERNS:
            if re.search(pattern, full_text_probe, re.IGNORECASE):
                highest_score = max(highest_score, 0.90)
                indicators["identified_trojan_profile"] = trojan_label
                evidence_list.append(
                    Evidence(
                        code="TROJAN_PACKAGE_NAME",
                        severity=SeverityLevel.CRITICAL,
                        title=f"Flagged Package Profile: {trojan_label}",
                        plain_text=f"The application name or manifest matches known malware distribution vectors: {trojan_label}.",
                        source=ScanSource.RULE,
                        span=None,
                    )
                )

        # 2. Permission Bundles Evaluation
        detected_perms = []
        for perm, info in DANGEROUS_PERMISSIONS.items():
            perm_short = perm.split(".")[-1]
            if perm.lower() in manifest_text.lower() or perm_short.lower() in manifest_text.lower():
                detected_perms.append(perm)
                indicators["flagged_permissions"].append(perm)
                highest_score = max(highest_score, info["weight"])

                evidence_list.append(
                    Evidence(
                        code=f"DANGEROUS_PERM_{perm_short.upper()}",
                        severity=info["severity"],
                        title=info["title"],
                        plain_text=info["detail"],
                        source=ScanSource.RULE,
                        span=None,
                    )
                )

        indicators["permissions_analyzed"] = detected_perms

        # 3. Lethal Combination Rules
        has_accessibility = "android.permission.BIND_ACCESSIBILITY_SERVICE" in detected_perms
        has_sms = "android.permission.RECEIVE_SMS" in detected_perms or "android.permission.READ_SMS" in detected_perms
        has_overlay = "android.permission.SYSTEM_ALERT_WINDOW" in detected_perms

        if has_accessibility and has_sms:
            highest_score = 0.98
            evidence_list.insert(
                0,
                Evidence(
                    code="LETHAL_BANKING_TROJAN_BUNDLE",
                    severity=SeverityLevel.CRITICAL,
                    title="Critical Banking Trojan Permission Combo",
                    plain_text="Combines Accessibility Service abuse with SMS interception. This is the hallmark signature of mobile banking trojans designed to steal 2FA OTPs and silently authorize transactions.",
                    source=ScanSource.RULE,
                    span=None,
                )
            )
        elif has_overlay and has_sms:
            highest_score = max(highest_score, 0.92)
            evidence_list.insert(
                0,
                Evidence(
                    code="OVERLAY_OTP_HARVEST_BUNDLE",
                    severity=SeverityLevel.CRITICAL,
                    title="Overlay + SMS OTP Harvesting Combo",
                    plain_text="Draws phishing login overlays while reading incoming authentication SMS codes.",
                    source=ScanSource.RULE,
                    span=None,
                )
            )

        latency_ms = int((time.time() - start_time) * 1000)

        # Verdict calculation
        if highest_score >= 0.75:
            verdict = Verdict.DANGEROUS
        elif highest_score >= 0.40:
            verdict = Verdict.SUSPICIOUS
        else:
            verdict = Verdict.SAFE

        confidence = 0.95 if detected_perms or indicators["identified_trojan_profile"] else 0.70

        return Finding(
            module=self.name,
            score=round(highest_score, 3),
            confidence=confidence,
            verdict=verdict,
            evidence=evidence_list,
            indicators=indicators,
            source=ScanSource.RULE,
            latency_ms=latency_ms,
        )


apk_profiler = APKProfiler()
