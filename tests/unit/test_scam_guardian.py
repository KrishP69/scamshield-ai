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


@pytest.mark.asyncio
async def test_telegram_real_fishy_messages():
    # 1. VIP Crypto Signal Multiplier
    crypto_msg = "VIP Crypto Signals Channel! Daily 200% - 500% guaranteed profit. Join our exclusive insider group: t.me/crypto_vip_pumps. Send 100 USDT get 500 USDT in 2 hours!"
    ctx_crypto = ScanContext(scan_id="test-tg-1", raw_text=crypto_msg, cleaned_text=crypto_msg)
    finding_crypto = await scam_guardian.analyze(ctx_crypto)
    assert finding_crypto.score >= 0.70
    assert any(e.code == "TOO_GOOD_TO_BE_TRUE" for e in finding_crypto.evidence)

    # 2. Telegram Part-time Job Review Task
    task_msg = "Part time job online: Watch youtube videos, like and get 50 per like. Daily payout 2000-5000 INR on UPI. Contact manager on Telegram: @hr_priya or t.me/dailyearn"
    ctx_task = ScanContext(scan_id="test-tg-2", raw_text=task_msg, cleaned_text=task_msg)
    finding_task = await scam_guardian.analyze(ctx_task)
    assert finding_task.score >= 0.70
    assert any(e.code == "TASK_JOB_SCAM" for e in finding_task.evidence)

    # 3. Telegram Security Phishing Verification Code
    phish_msg = "Telegram Notification: Your account will be terminated in 24 hours. Click t.me/TelegramVerificationBot to verify or enter your login code"
    ctx_phish = ScanContext(scan_id="test-tg-3", raw_text=phish_msg, cleaned_text=phish_msg)
    finding_phish = await scam_guardian.analyze(ctx_phish)
    assert finding_phish.score >= 0.75
    assert any(e.code == "CREDENTIAL_REQUEST" for e in finding_phish.evidence)

