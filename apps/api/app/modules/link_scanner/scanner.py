import asyncio
from datetime import datetime, timezone
import time
from typing import Any, Dict, List, Optional
import uuid
from app.core.logging import logger
from app.modules.base import DetectionModule, ScanContext
from app.modules.link_scanner.heuristics import analyze_heuristics
from app.modules.link_scanner.homoglyph import detect_punycode_and_homoglyphs
from app.modules.link_scanner.ssrf import detect_ssrf_and_ip_host
from app.modules.link_scanner.threat_intel import (
    add_detected_threat_to_feed,
    check_threat_intel_realtime,
)
from app.modules.link_scanner.unshortener import unshorten_url
from app.preprocess.entities import extract_urls
from app.schemas.common import RiskLevel, ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding


async def analyze_url_realtime(raw_url: str) -> Dict[str, Any]:
    """
    Performs comprehensive real-time analysis of a URL across all detection methods.
    Returns structured results including the exact detection method used.
    """
    start_time = time.time()
    url = raw_url.strip()
    if not url.startswith(("http://", "https://")):
        url = "http://" + url

    # 1. Unshorten redirect chain safely
    unshorten_res = await unshorten_url(url)
    target_url = unshorten_res["final_url"]

    # 2. Parallel execution of detection methods on the target URL
    ssrf_task = asyncio.create_task(asyncio.to_thread(detect_ssrf_and_ip_host, target_url))
    homoglyph_task = asyncio.create_task(asyncio.to_thread(detect_punycode_and_homoglyphs, target_url))
    heuristics_task = asyncio.create_task(asyncio.to_thread(analyze_heuristics, target_url))
    intel_task = asyncio.create_task(check_threat_intel_realtime(target_url))

    ssrf_res, homoglyph_res, heuristics_res, intel_res = await asyncio.gather(
        ssrf_task, homoglyph_task, heuristics_task, intel_task
    )

    # 3. Method Evaluation & Priority Synthesis
    methods_triggered: List[str] = []
    reasons: List[Dict[str, Any]] = []
    risk_score = 0
    primary_method = "Clean URL Validation"

    # Evaluation: Live Threat Intelligence
    if intel_res.get("is_flagged"):
        risk_score = max(risk_score, 95)
        m_name = intel_res.get("detection_method") or "URLhaus Threat Intelligence Match"
        methods_triggered.append(m_name)
        reasons.append({
            "code": "PHISHING_URL_EXTERNAL_INTEL",
            "title": "Confirmed Malicious Phishing URL",
            "description": f"URL matches verified threat database feed ({intel_res.get('source')}).",
            "severity": "critical",
        })

    # Evaluation: Homoglyph & Punycode Impersonation
    if homoglyph_res.get("is_fishy"):
        risk_score = max(risk_score, 92)
        m_name = homoglyph_res.get("detection_method") or "Homoglyph / Punycode Look-alike Impersonation"
        methods_triggered.append(m_name)
        reasons.append({
            "code": "PHISHING_URL_HOMOGLYPH",
            "title": "Homoglyph / Look-alike Spoofing Detected",
            "description": f"URL uses confusable Unicode/Punycode characters to impersonate {homoglyph_res.get('spoofed_brand') or 'a legitimate brand'}.",
            "severity": "critical",
        })

    # Evaluation: SSRF & Private IP Address
    if ssrf_res.get("is_ssrf_risk"):
        risk_score = max(risk_score, 88)
        m_name = ssrf_res.get("detection_method") or "SSRF & Private Subnet Isolation Guard"
        methods_triggered.append(m_name)
        reasons.append({
            "code": "PHISHING_URL_SSRF",
            "title": "Restricted Subnet / SSRF Target Detected",
            "description": f"URL resolves to internal or restricted IP network ({ssrf_res.get('ip_address')}).",
            "severity": "critical",
        })

    # Evaluation: Heuristics & Keywords & High-Risk TLDs
    if heuristics_res.get("is_fishy"):
        h_score = int(heuristics_res.get("score", 0) * 100)
        risk_score = max(risk_score, h_score)
        m_name = heuristics_res.get("primary_method") or "Heuristic Threat Pattern"
        methods_triggered.append(m_name)
        reasons.append({
            "code": "PHISHING_URL_HEURISTICS",
            "title": "Suspicious URL Structure & Keywords",
            "description": f"Domain exhibits risky TLD (.{heuristics_res.get('tld')}) or brand harvest terms: {', '.join(heuristics_res.get('matched_keywords', []))}.",
            "severity": "high" if h_score >= 70 else "caution",
        })

    # Evaluation: Unshortener Hops
    if unshorten_res.get("is_shortener") or unshorten_res.get("has_redirects"):
        if unshorten_res.get("detection_method"):
            methods_triggered.append(unshorten_res["detection_method"])
        if risk_score >= 60:
            reasons.append({
                "code": "PHISHING_URL_UNSHORTENED",
                "title": "Obfuscated Redirect Chain Masking Destination",
                "description": f"Shortener hopped through {unshorten_res['hop_count']} redirect(s) before reaching target: {target_url}.",
                "severity": "medium",
            })

    # Determine primary method based on highest priority
    if methods_triggered:
        primary_method = f"Method: {methods_triggered[0]}"
    else:
        primary_method = "Method: Real-Time Multi-Vector Safe Verification (No Red Flags)"

    # Risk level classification
    if risk_score >= 75:
        risk_level = RiskLevel.CRITICAL
    elif risk_score >= 50:
        risk_level = RiskLevel.HIGH
    elif risk_score >= 25:
        risk_level = RiskLevel.CAUTION
    else:
        risk_level = RiskLevel.LOW

    is_fishy = risk_score >= 45
    latency_ms = int((time.time() - start_time) * 1000)

    # Synthesize 5 structured threat factors explaining why this link is fishy
    factors = [
        {
            "category": "Domain & Identity",
            "title": "Homoglyph & Brand Impersonation Factor",
            "is_triggered": homoglyph_res.get("is_fishy", False) or bool(heuristics_res.get("matched_brands")),
            "severity": "critical" if homoglyph_res.get("is_fishy") else ("high" if heuristics_res.get("matched_brands") else "safe"),
            "explanation": (
                f"The domain uses confusable Unicode/Punycode characters or unofficial branding to mimic {homoglyph_res.get('spoofed_brand') or ', '.join(heuristics_res.get('matched_brands', [])) or 'a legitimate brand'}, tricking users into believing it is genuine."
                if (homoglyph_res.get("is_fishy") or heuristics_res.get("matched_brands"))
                else "No look-alike characters or brand impersonation detected in domain identity."
            ),
            "evidence_snippet": homoglyph_res.get("original_domain") if homoglyph_res.get("is_fishy") else (", ".join(heuristics_res.get("matched_brands", [])) or None),
        },
        {
            "category": "Host & Routing",
            "title": "Network Routing & SSRF Isolation Factor",
            "is_triggered": ssrf_res.get("is_ssrf_risk", False) or unshorten_res.get("has_redirects", False),
            "severity": "critical" if ssrf_res.get("is_ssrf_risk") else ("medium" if unshorten_res.get("has_redirects") else "safe"),
            "explanation": (
                f"Points to a private internal network or metadata IP ({ssrf_res.get('ip_address')}), or conceals its true destination behind {unshorten_res.get('hop_count')} URL redirect hop(s)."
                if (ssrf_res.get("is_ssrf_risk") or unshorten_res.get("has_redirects"))
                else "Standard direct web routing without masking redirects or private IP targets."
            ),
            "evidence_snippet": ssrf_res.get("ip_address") or (f"{unshorten_res.get('hop_count')} redirects" if unshorten_res.get("has_redirects") else None),
        },
        {
            "category": "Social Engineering",
            "title": "Urgency & High-Risk TLD Lure Factor",
            "is_triggered": heuristics_res.get("is_high_risk_tld", False) or bool(heuristics_res.get("matched_keywords")),
            "severity": "high" if heuristics_res.get("is_high_risk_tld") and heuristics_res.get("matched_keywords") else ("medium" if heuristics_res.get("is_high_risk_tld") or heuristics_res.get("matched_keywords") else "safe"),
            "explanation": (
                f"Hosted on a cheap disposable TLD (.{heuristics_res.get('tld')}) frequently favored by phishers, paired with urgency-triggering terms: {', '.join(heuristics_res.get('matched_keywords', []))}."
                if (heuristics_res.get("is_high_risk_tld") or heuristics_res.get("matched_keywords"))
                else "Standard top-level domain without flagged phishing trigger words."
            ),
            "evidence_snippet": f".{heuristics_res.get('tld')} | {', '.join(heuristics_res.get('matched_keywords', [])[:3])}" if (heuristics_res.get("is_high_risk_tld") or heuristics_res.get("matched_keywords")) else None,
        },
        {
            "category": "Threat Intelligence",
            "title": "External Threat Database Factor",
            "is_triggered": intel_res.get("is_flagged", False),
            "severity": "critical" if intel_res.get("is_flagged") else "safe",
            "explanation": (
                f"Matches confirmed malicious URLs reported in active cyber intelligence feeds ({intel_res.get('source')})."
                if intel_res.get("is_flagged")
                else "No matching threat signatures found in live feeds."
            ),
            "evidence_snippet": intel_res.get("source") if intel_res.get("is_flagged") else None,
        },
        {
            "category": "Algorithmic Generation",
            "title": "Domain Randomness & DGA Factor",
            "is_triggered": heuristics_res.get("is_dga_entropy", False),
            "severity": "high" if heuristics_res.get("is_dga_entropy") else "safe",
            "explanation": (
                f"Displays abnormally high Shannon entropy ({heuristics_res.get('entropy')} bits/char), indicating an algorithmically generated disposable domain (DGA) designed to bypass static blocklists."
                if heuristics_res.get("is_dga_entropy")
                else f"Normal linguistic character entropy ({heuristics_res.get('entropy')} bits/char)."
            ),
            "evidence_snippet": f"Entropy: {heuristics_res.get('entropy')} bits/char" if heuristics_res.get("is_dga_entropy") else None,
        },
    ]

    result_payload = {
        "url": raw_url,
        "final_url": target_url,
        "is_fishy": is_fishy,
        "risk_score": risk_score,
        "risk_level": risk_level.value,
        "primary_detection_method": primary_method,
        "detection_methods_used": methods_triggered,
        "factors": factors,
        "reasons": reasons,
        "technical_breakdown": {
            "unshortened_hops": unshorten_res.get("hop_count", 0),
            "is_punycode": homoglyph_res.get("is_punycode", False),
            "has_homoglyphs": homoglyph_res.get("has_homoglyphs", False),
            "is_ip_host": ssrf_res.get("is_ip_host", False),
            "ip_address": ssrf_res.get("ip_address"),
            "entropy": heuristics_res.get("entropy", 0.0),
            "tld": heuristics_res.get("tld", ""),
            "matched_keywords": heuristics_res.get("matched_keywords", []),
            "matched_brands": heuristics_res.get("matched_brands", []),
            "threat_feed_source": intel_res.get("source"),
        },
        "latency_ms": latency_ms,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # If fishy, add to live threat feed so the website shows the latest caught link in real time!
    if is_fishy:
        add_detected_threat_to_feed({
            "id": f"th-live-{uuid.uuid4().hex[:8]}",
            "url": raw_url,
            "display_domain": target_url.replace("https://", "").replace("http://", "").split("/")[0],
            "threat_type": (
                "Punycode Homoglyph Look-alike Spoofing"
                if homoglyph_res.get("is_fishy")
                else (
                    "Internal SSRF / IP Target"
                    if ssrf_res.get("is_ssrf_risk")
                    else (
                        "Phishing & Credential Harvest"
                        if heuristics_res.get("matched_keywords")
                        else "Malicious / High-Risk Web Destination"
                    )
                )
            ),
            "risk_score": risk_score,
            "risk_level": risk_level.value,
            "detection_method": primary_method.replace("Method: ", ""),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "origin": "Live Link Scanner",
        })

    return result_payload


class SafeLinkScannerModule:
    """DetectionModule implementation for orchestrator pipeline."""
    name: str = "link_scanner"

    async def analyze(self, ctx: ScanContext) -> Finding:
        start_time = time.time()
        # Find URLs from context entities or extract directly from text
        urls = ctx.entities.get("urls", []) if ctx.entities else []
        if not urls:
            raw = ctx.raw_text or ctx.cleaned_text or ""
            urls = extract_urls(raw)

        if not urls:
            # No URLs present in input
            return Finding(
                module=self.name,
                score=0.0,
                confidence=1.0,
                verdict=Verdict.SAFE,
                evidence=[],
                indicators={"urls_analyzed": 0},
                source=ScanSource.RULE,
                latency_ms=0,
            )

        # Analyze all discovered URLs in parallel
        tasks = [analyze_url_realtime(u) for u in urls]
        url_results = await asyncio.gather(*tasks, return_exceptions=True)

        highest_score = 0
        all_evidence: List[Evidence] = []
        detection_methods: List[str] = []

        raw_text = ctx.raw_text or ""

        for res in url_results:
            if isinstance(res, dict):
                score = res.get("risk_score", 0) / 100.0
                if score > highest_score:
                    highest_score = score

                u_str = res.get("url", "")
                span = None
                if u_str and u_str in raw_text:
                    start_idx = raw_text.find(u_str)
                    span = (start_idx, start_idx + len(u_str))

                if res.get("primary_detection_method"):
                    detection_methods.append(res["primary_detection_method"])

                for r in res.get("reasons", []):
                    all_evidence.append(
                        Evidence(
                            code=r.get("code", "PHISHING_URL_DETECTED"),
                            severity=SeverityLevel(r.get("severity", "high")),
                            title=r.get("title", "Suspicious Link Detected"),
                            plain_text=f"{r.get('description', '')} ({res.get('primary_detection_method', '')})",
                            source=ScanSource.EXTERNAL_API if "Intel" in res.get("primary_detection_method", "") else ScanSource.RULE,
                            span=span,
                        )
                    )

        if highest_score >= 0.70:
            verdict = Verdict.DANGEROUS
            confidence = 0.95
        elif highest_score >= 0.35:
            verdict = Verdict.SUSPICIOUS
            confidence = 0.85
        else:
            verdict = Verdict.SAFE
            confidence = 0.90

        latency_ms = int((time.time() - start_time) * 1000)

        return Finding(
            module=self.name,
            score=round(highest_score, 2),
            confidence=round(confidence, 2),
            verdict=verdict,
            evidence=all_evidence,
            indicators={
                "urls_count": len(urls),
                "primary_methods": detection_methods,
                "predicted_scam_type": "kyc_bank_upi" if highest_score >= 0.70 else None,
            },
            source=ScanSource.EXTERNAL_API if any("Intel" in m for m in detection_methods) else ScanSource.RULE,
            latency_ms=latency_ms,
        )


link_scanner = SafeLinkScannerModule()
