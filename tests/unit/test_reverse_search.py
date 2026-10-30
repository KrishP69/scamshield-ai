import pytest
from app.modules.base import ScanContext
from app.modules.reverse_search.phash import match_scam_photo_phash
from app.modules.reverse_search.service import reverse_search


def test_phash_matching():
    # Exact match with known scam hash
    is_match, meta = match_scam_photo_phash("8f8f8e8e1c1c1c1c")
    assert is_match is True
    assert meta is not None
    assert "Cloned Identity" in meta["title"]

    # Clean unrelated hash
    clean_match, _ = match_scam_photo_phash("0000000000000000")
    assert clean_match is False


@pytest.mark.asyncio
async def test_reverse_search_module():
    ctx = ScanContext(
        scan_id="test-rev-1",
        entities={"usernames": ["official_support_bot", "random_1234567"]}
    )
    finding = await reverse_search.analyze(ctx)

    assert finding.module == "reverse_search"
    assert finding.score >= 0.70
    codes = [e.code for e in finding.evidence]
    assert "OFFICIAL_IMPERSONATION_HANDLE" in codes

