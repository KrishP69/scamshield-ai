import pytest
from app.modules.base import ScanContext
from app.modules.scam_guardian.baseline import baseline_classifier
from app.modules.scam_guardian.guardian import scam_guardian
from app.modules.scam_guardian.tactics import detect_tactics


def test_tactics_detection_and_spans():
    text = "Please transfer Rs. 2,000 as refundable gate pass security deposit urgently within 15 minutes."
    evidences = detect_tactics(text)
    codes = [e.code for e in evidences]
    assert "ADVANCE_PAYMENT_REQUEST" in codes
    assert "URGENCY" in codes

    # Verify that spans point to actual characters in the text
    for e in evidences:
        if e.span:
            start, end = e.span
            assert start >= 0
            assert end <= len(text)
            assert len(text[start:end]) > 0


def test_baseline_classifier():
    scam_text = "I am in the Indian Army transfer advance gate pass deposit"
    scam_type, conf = baseline_classifier.predict(scam_text)
    assert scam_type == "marketplace_advance_payment"
    assert conf > 0.3

    legit_text = "Hi yes the bicycle is available for test ride in Bandra West this Saturday"
    legit_type, legit_conf = baseline_classifier.predict(legit_text)
    assert legit_type == "legit"


@pytest.mark.asyncio
async def test_scam_guardian_module():
    ctx = ScanContext(
        scan_id="test-guard-1",
        raw_text="I am army officer please transfer Rs 2000 advance courier security deposit urgently within 10 minutes",
        cleaned_text="I am army officer please transfer Rs 2000 advance courier security deposit urgently within 10 minutes",
    )
    finding = await scam_guardian.analyze(ctx)
    assert finding.module == "scam_guardian"
    assert finding.score >= 0.70
    assert finding.verdict.value == "dangerous"
    assert len(finding.evidence) >= 2
