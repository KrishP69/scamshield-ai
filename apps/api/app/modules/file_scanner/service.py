import hashlib
import time
from typing import Any, Dict, List
from app.intel.virustotal import virustotal_adapter
from app.modules.base import DetectionModule, ScanContext
from app.modules.file_scanner.apk_parser import inspect_package_name, inspect_permissions
from app.schemas.common import ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding


class FileScannerModule:
    name: str = "file_scanner"

    async def analyze(self, ctx: ScanContext) -> Finding:
        start_time = time.time()
        file_bytes = ctx.file_bytes
        file_name = ctx.file_name or ""
        meta = ctx.metadata or {}

        # Also support SHA-256 or package name passed in metadata (e.g., in Scenario 5 test payload)
        sha256_hash = meta.get("sha256")
        if not sha256_hash and file_bytes:
            sha256_hash = hashlib.sha256(file_bytes).hexdigest()

        package_name = meta.get("package_name") or ""
        permissions = meta.get("permissions") or []

        # If no file or hash provided, return safe/not-checked
        if not sha256_hash and not file_bytes and not file_name:
            return Finding(
                module=self.name,
                score=0.0,
                confidence=1.0,
                verdict=Verdict.SAFE,
                evidence=[],
                indicators={"files_scanned": 0},
                source=ScanSource.RULE,
                latency_ms=0,
            )

        evidence_list: List[Evidence] = []
        max_score = 0.0
        primary_source = ScanSource.RULE

        # 1. VirusTotal SHA-256 Hash Lookup
        if sha256_hash:
            vt_res = await virustotal_adapter.lookup_hash(sha256_hash)
            if vt_res.get("is_threat"):
                max_score = max(max_score, 0.98)
                positives = vt_res.get("positives", 1)
                total = vt_res.get("total_engines", 70)
                primary_source = ScanSource.EXTERNAL_API if vt_res.get("source") != "rule" else ScanSource.RULE
                evidence_list.append(
                    Evidence(
                        code="VIRUSTOTAL_MALWARE_HIT",
                        severity=SeverityLevel.CRITICAL,
                        title=f"VirusTotal Threat Detection ({positives}/{total} Engines)",
                        plain_text=f"The file SHA-256 hash was flagged as malicious by {positives} security engines on VirusTotal.",
                        source=primary_source,
                        span=None,
                    )
                )

        # 2. Android APK Permission Analysis
        if permissions:
            flags, is_critical, summary = inspect_permissions(permissions)
            if is_critical:
                max_score = max(max_score, 0.92)
                evidence_list.append(
                    Evidence(
                        code="DANGEROUS_PERMISSIONS_COMBO",
                        severity=SeverityLevel.CRITICAL,
                        title="Dangerous Android Permission Combination",
                        plain_text=f"APK requests high-risk permissions: {summary}",
                        source=ScanSource.RULE,
                        span=None,
                    )
                )

        # 3. Package Name Impersonation
        if package_name:
            is_impersonation, note = inspect_package_name(package_name)
            if is_impersonation:
                max_score = max(max_score, 0.88)
                evidence_list.append(
                    Evidence(
                        code="PACKAGE_NAME_IMPERSONATION",
                        severity=SeverityLevel.HIGH,
                        title="Official Banking App Impersonation",
                        plain_text=note,
                        source=ScanSource.RULE,
                        span=None,
                    )
                )

        latency_ms = int((time.time() - start_time) * 1000)
        verdict = Verdict.DANGEROUS if max_score >= 0.70 else (Verdict.SUSPICIOUS if max_score >= 0.30 else Verdict.SAFE)

        return Finding(
            module=self.name,
            score=round(max_score, 2),
            confidence=0.95 if max_score >= 0.70 else 0.85,
            verdict=verdict,
            evidence=evidence_list,
            indicators={
                "sha256": sha256_hash or "",
                "file_name": file_name,
                "package_name": package_name,
                "permissions_count": len(permissions),
            },
            source=primary_source,
            latency_ms=latency_ms,
        )


file_scanner = FileScannerModule()
