import re
import time
import urllib.parse
from typing import Any, Dict, List
from app.intel.gsb import gsb_adapter
from app.intel.urlhaus import urlhaus_adapter
from app.modules.base import DetectionModule, ScanContext
from app.modules.link_scanner.unshorten import safe_unshorten_url
from app.schemas.common import ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding

# High-risk TLDs commonly abused for rapid phishing and throwaway lure campaigns
HIGH_RISK_TLDS = {".xyz", ".top", ".vip", ".online", ".site", ".live", ".work", ".info", ".buzz", ".cam", ".app"}

# Sensitive target brands targeted by homoglyph / look-alike campaigns
TARGET_BRANDS = [
    "sbi", "yono", "paytm", "hdfc", "icici", "kotak", "axis", "punjab-national",
    "binance", "metamask", "telegram", "facebook", "whatsapp", "netflix",
]


def canonicalize_url(url: str) -> str:
    """Canonicalizes URL: lowercases scheme and host, removes tracking parameters."""
    if not url.lower().startswith(("http://", "https://")):
        url = "http://" + url
    parsed = urllib.parse.urlparse(url)
    clean_host = parsed.hostname.lower() if parsed.hostname else ""
    # Strip tracking query params (utm_*, ref, fbclid)
    clean_query = "&".join(
        [q for q in parsed.query.split("&") if q and not any(q.startswith(p) for p in ("utm_", "fbclid=", "ref="))]
    )
    port_str = f":{parsed.port}" if parsed.port and parsed.port not in (80, 443) else ""
    return urllib.parse.urlunparse((
        parsed.scheme.lower(),
        f"{clean_host}{port_str}",
        parsed.path,
        parsed.params,
        clean_query,
        "",
    ))


class LinkScannerModule:
    name: str = "link_scanner"

    async def analyze(self, ctx: ScanContext) -> Finding:
        start_time = time.time()
        urls = ctx.entities.get("urls", [])

        if not urls:
            return Finding(
                module=self.name,
                score=0.0,
                confidence=1.0,
                verdict=Verdict.SAFE,
                evidence=[],
                indicators={"urls_scanned": 0},
                source=ScanSource.RULE,
                latency_ms=0,
            )

        evidence_list: List[Evidence] = []
        max_score = 0.0
        intel_sources: List[str] = []

        for raw_url in urls:
            canon_url = canonicalize_url(raw_url)
            final_url, redirect_chain, ssrf_error = await safe_unshorten_url(canon_url)
            parsed = urllib.parse.urlparse(final_url)
            host = parsed.hostname or ""

            # 1. Threat Intel: URLhaus
            uh_res = await urlhaus_adapter.lookup_url(final_url)
            if uh_res.get("is_threat"):
                max_score = max(max_score, 0.95)
                intel_sources.append(uh_res.get("source", "external_api"))
                evidence_list.append(
                    Evidence(
                        code="CONFIRMED_MALICIOUS_URL",
                        severity=SeverityLevel.CRITICAL,
                        title="Blacklisted Phishing / Malware URL",
                        plain_text=f"The link {final_url} is listed in security threat intelligence feeds as active phishing.",
                        source=ScanSource.EXTERNAL_API if uh_res.get("source") != "rule" else ScanSource.RULE,
                        span=None,
                    )
                )

            # 2. Threat Intel: Google Safe Browsing
            gsb_res = await gsb_adapter.lookup_url(final_url)
            if gsb_res.get("is_threat"):
                max_score = max(max_score, 0.98)
                intel_sources.append("external_api")
                evidence_list.append(
                    Evidence(
                        code="SAFE_BROWSING_HIT",
                        severity=SeverityLevel.CRITICAL,
                        title="Google Safe Browsing Flag",
                        plain_text=f"Flagged as {', '.join(gsb_res.get('threat_types', ['threat']))} by Google Safe Browsing.",
                        source=ScanSource.EXTERNAL_API,
                        span=None,
                    )
                )

            # 3. Lexical & Homoglyph Heuristics
            # Look-alike check on known target brands
            for brand in TARGET_BRANDS:
                if brand in host and not host.endswith((f".{brand}.com", f".{brand}.co.in", f".{brand}.org")):
                    max_score = max(max_score, 0.85)
                    evidence_list.append(
                        Evidence(
                            code="LOOKALIKE_BRAND_DOMAIN",
                            severity=SeverityLevel.HIGH,
                            title=f"Brand Impersonation Look-Alike ({brand.upper()})",
                            plain_text=f"The domain '{host}' incorporates the brand name '{brand}', but is not official.",
                            source=ScanSource.RULE,
                            span=None,
                        )
                    )
                    break

            # Suspicious TLD check
            for tld in HIGH_RISK_TLDS:
                if host.endswith(tld):
                    max_score = max(max_score, 0.60)
                    evidence_list.append(
                        Evidence(
                            code="HIGH_RISK_TLD",
                            severity=SeverityLevel.MEDIUM,
                            title=f"High-Risk Top Level Domain ({tld})",
                            plain_text=f"The link uses the {tld} extension, commonly observed in throwaway fraudulent campaigns.",
                            source=ScanSource.RULE,
                            span=None,
                        )
                    )
                    break

            # Insecure HTTP on credential/banking target
            if parsed.scheme == "http" and any(k in host for k in ("kyc", "bank", "pay", "login", "update")):
                max_score = max(max_score, 0.70)
                evidence_list.append(
                    Evidence(
                        code="INSECURE_HTTP_LOGIN",
                        severity=SeverityLevel.HIGH,
                        title="Unencrypted HTTP Connection for Sensitive Portal",
                        plain_text="The portal asks for security updates over unencrypted HTTP rather than HTTPS.",
                        source=ScanSource.RULE,
                        span=None,
                    )
                )

        latency_ms = int((time.time() - start_time) * 1000)
        verdict = Verdict.DANGEROUS if max_score >= 0.70 else (Verdict.SUSPICIOUS if max_score >= 0.30 else Verdict.SAFE)
        primary_source = ScanSource.EXTERNAL_API if "external_api" in intel_sources else (ScanSource.RULE if evidence_list else ScanSource.OFFLINE_FALLBACK)

        return Finding(
            module=self.name,
            score=round(max_score, 2),
            confidence=0.95 if max_score >= 0.70 else 0.85,
            verdict=verdict,
            evidence=evidence_list,
            indicators={
                "urls_scanned": len(urls),
                "redirect_chains": len(urls),
            },
            source=primary_source,
            latency_ms=latency_ms,
        )


link_scanner = LinkScannerModule()
