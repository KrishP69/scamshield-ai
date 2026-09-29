import pytest
from app.modules.link_scanner.heuristics import analyze_heuristics
from app.modules.link_scanner.homoglyph import detect_punycode_and_homoglyphs
from app.modules.link_scanner.scanner import analyze_url_realtime, link_scanner
from app.modules.link_scanner.ssrf import detect_ssrf_and_ip_host
from app.modules.link_scanner.threat_intel import get_live_threat_feed
from app.modules.base import ScanContext
from app.schemas.common import PlatformType, Verdict


def test_homoglyph_and_punycode_detection():
    # Cyrillic 'a' (U+0430) spoofing sbi.co.in
    spoofed = "http://s\u0430i.co.in/login"
    result = detect_punycode_and_homoglyphs(spoofed)
    assert result["has_homoglyphs"] is True
    assert result["is_fishy"] is True
    assert "Homoglyph" in result["detection_method"]

    # Punycode domain
    puny = "http://xn--80ak6aa92e.com"
    result_puny = detect_punycode_and_homoglyphs(puny)
    assert result_puny["is_punycode"] is True
    assert result_puny["is_fishy"] is True

    # Genuine domain without homoglyphs
    clean = "https://google.com"
    clean_res = detect_punycode_and_homoglyphs(clean)
    assert clean_res["has_homoglyphs"] is False
    assert clean_res["is_fishy"] is False


def test_ssrf_and_private_ip_detection():
    # RFC 1918 private range
    res_192 = detect_ssrf_and_ip_host("http://192.168.1.1/admin")
    assert res_192["is_ip_host"] is True
    assert res_192["is_ssrf_risk"] is True
    assert "SSRF" in res_192["detection_method"]

    # Loopback
    res_127 = detect_ssrf_and_ip_host("http://127.0.0.1:8080")
    assert res_127["is_ssrf_risk"] is True

    # Cloud metadata link-local
    res_meta = detect_ssrf_and_ip_host("http://169.254.169.254/latest/meta-data")
    assert res_meta["is_cloud_metadata"] is True
    assert res_meta["is_ssrf_risk"] is True

    # Normal public domain
    clean = detect_ssrf_and_ip_host("https://example.com")
    assert clean["is_ip_host"] is False
    assert clean["is_ssrf_risk"] is False


def test_heuristics_high_risk_tld_and_brand_impersonation():
    url = "http://sbi-yono-kyc-update.xyz/login"
    res = analyze_heuristics(url)
    assert res["is_fishy"] is True
    assert res["is_high_risk_tld"] is True
    assert "sbi" in res["matched_brands"]
    assert "kyc" in res["matched_keywords"]
    assert "Brand Impersonation" in res["primary_method"] or "High-Risk" in res["primary_method"]


@pytest.mark.asyncio
async def test_realtime_url_analyzer_shows_detection_method():
    url = "http://sbi-yono-kyc-update.xyz/login"
    result = await analyze_url_realtime(url)
    assert result["is_fishy"] is True
    assert result["risk_score"] >= 85
    assert "Method:" in result["primary_detection_method"]
    assert len(result["detection_methods_used"]) >= 1
    assert "technical_breakdown" in result
    assert result["technical_breakdown"]["tld"] == "xyz"


@pytest.mark.asyncio
async def test_link_scanner_module_analyze():
    ctx = ScanContext(
        scan_id="test-scan-link-1",
        raw_text="Urgent: Your SBI account suspended. Update KYC now at http://sbi-yono-kyc-update.xyz/login",
        platform=PlatformType.TELEGRAM,
    )
    finding = await link_scanner.analyze(ctx)
    assert finding.module == "link_scanner"
    assert finding.score >= 0.85
    assert finding.verdict == Verdict.DANGEROUS
    assert len(finding.evidence) >= 1
    assert any("Method:" in ev.plain_text for ev in finding.evidence)


def test_live_threat_feed_buffer():
    feed = get_live_threat_feed(limit=5)
    assert len(feed) > 0
    first = feed[0]
    assert "url" in first
    assert "threat_type" in first
    assert "risk_score" in first
    assert "detection_method" in first
    assert "timestamp" in first
