import pytest
from app.modules.base import ScanContext
from app.modules.link_scanner.service import canonicalize_url, link_scanner
from app.modules.link_scanner.unshorten import is_ip_allowed


def test_canonicalize_url():
    raw = "HTTPS://WWW.EXAMPLE.COM/login?utm_source=fb&id=123#ref"
    canon = canonicalize_url(raw)
    assert canon == "https://www.example.com/login?id=123"


def test_ssrf_ip_filtering():
    # Forbidden IPs
    assert not is_ip_allowed("127.0.0.1")
    assert not is_ip_allowed("10.0.0.5")
    assert not is_ip_allowed("192.168.1.1")
    assert not is_ip_allowed("169.254.169.254")  # AWS/Cloud metadata
    assert not is_ip_allowed("::1")

    # Allowed public IPs
    assert is_ip_allowed("8.8.8.8")
    assert is_ip_allowed("1.1.1.1")


@pytest.mark.asyncio
async def test_link_scanner_homoglyph_and_tld():
    ctx = ScanContext(
        scan_id="test-link-1",
        raw_text="Update KYC at http://sbi-yono-kyc-update.xyz/login",
        cleaned_text="Update KYC at http://sbi-yono-kyc-update.xyz/login",
        entities={"urls": ["http://sbi-yono-kyc-update.xyz/login"]},
    )
    finding = await link_scanner.analyze(ctx)
    assert finding.module == "link_scanner"
    assert finding.score >= 0.85
    assert finding.verdict.value == "dangerous"

    codes = [e.code for e in finding.evidence]
    assert "LOOKALIKE_BRAND_DOMAIN" in codes
    assert "HIGH_RISK_TLD" in codes
