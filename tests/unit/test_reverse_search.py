import pytest
from app.modules.base import ScanContext
from app.modules.reverse_search.phash import match_scam_photo_phash
from app.modules.reverse_search.service import reverse_search


def test_phash_matching():
    # Matching hash within hamming distance 0
    is_match, meta = match_scam_photo_phash("8f8f8e8e1c1c1c1c")
    assert is_match
    assert meta is not None
    assert "Cloned Identity" in meta["title"]

    # Completely different hash
    no_match, _ = match_scam_photo_phash("0000000000000000")
    assert not no_match


@pytest.mark.asyncio
async def test_reverse_search_module():
    ctx = ScanContext(
        scan_id="test-rev-1",
        entities={
            "phones": [{"raw": "+2348012345678", "e164": "+2348012345678"}],
            "usernames": ["official_support_agent_991823"],
        },
        metadata={"photo_phash": "8f8f8e8e1c1c1c1c"},
    )
    finding = await reverse_search.analyze(ctx)
    assert finding.module == "reverse_search"
    assert finding.score >= 0.85

    codes = [e.code for e in finding.evidence]
    assert "RECYCLED_SCAM_PHOTO" in codes
    assert "FOREIGN_COUNTRY_CODE_MISMATCH" in codes
