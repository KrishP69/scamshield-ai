import pytest
from app.modules.base import ScanContext
from app.modules.file_scanner import apk_profiler
from app.modules.telegram_bot_scanner import telegram_bot_scanner
from app.modules.voice_verifier import voice_verifier
from app.schemas.common import PlatformType, Verdict


@pytest.mark.asyncio
async def test_telegram_bot_scanner_detection():
    # 1. Fake support bot
    fake_support = "URGENT: Your account is suspended. Connect with t.me/official_support_bot to unban."
    ctx_support = ScanContext(
        scan_id="tg-1",
        raw_text=fake_support,
        cleaned_text=fake_support,
        platform=PlatformType.TELEGRAM,
    )
    res_support = await telegram_bot_scanner.analyze(ctx_support)
    assert res_support.score >= 0.75
    assert res_support.verdict == Verdict.DANGEROUS
    assert any("FAKE_SUPPORT_BOT" in e.code for e in res_support.evidence)

    # 2. Crypto doubler bot
    doubler = "Join our auto trading bot! Double your crypto in 24 hours with guaranteed ROI!"
    ctx_doubler = ScanContext(
        scan_id="tg-2",
        raw_text=doubler,
        cleaned_text=doubler,
        platform=PlatformType.TELEGRAM,
    )
    res_doubler = await telegram_bot_scanner.analyze(ctx_doubler)
    assert res_doubler.score >= 0.75
    assert any("CRYPTO_DOUBLER_BOT" in e.code for e in res_doubler.evidence)

    # 3. Benign non-telegram text
    ctx_benign = ScanContext(
        scan_id="tg-3",
        raw_text="Let's grab a coffee at 4 PM in the cafe.",
        cleaned_text="Let's grab a coffee at 4 PM in the cafe.",
        platform=PlatformType.FACEBOOK,
    )
    res_benign = await telegram_bot_scanner.analyze(ctx_benign)
    assert res_benign.score == 0.0
    assert res_benign.verdict == Verdict.SAFE


@pytest.mark.asyncio
async def test_apk_profiler_detection():
    # 1. Lethal banking trojan combination
    lethal_manifest = """
    <manifest package="com.fake.bank.trojan">
        <uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />
        <uses-permission android:name="android.permission.RECEIVE_SMS" />
        <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    </manifest>
    """
    ctx_lethal = ScanContext(
        scan_id="apk-1",
        raw_text=lethal_manifest,
        cleaned_text=lethal_manifest,
        file_name="fake_sbi_kyc_update.apk",
    )
    res_lethal = await apk_profiler.analyze(ctx_lethal)
    assert res_lethal.score >= 0.90
    assert res_lethal.verdict == Verdict.DANGEROUS
    assert any("LETHAL_BANKING_TROJAN_BUNDLE" in e.code for e in res_lethal.evidence)
    assert any("TROJAN_PACKAGE_NAME" in e.code for e in res_lethal.evidence)

    # 2. Predatory loan harvester
    loan_text = "Fast loan instant cash credit app: android.permission.READ_CONTACTS android.permission.READ_SMS"
    ctx_loan = ScanContext(
        scan_id="apk-2",
        raw_text=loan_text,
        cleaned_text=loan_text,
        file_name="instant_cash_loan.apk",
    )
    res_loan = await apk_profiler.analyze(ctx_loan)
    assert res_loan.score >= 0.70
    assert any("TROJAN_PACKAGE_NAME" in e.code for e in res_loan.evidence)

    # 3. Non-apk benign context
    ctx_clean = ScanContext(
        scan_id="apk-3",
        raw_text="The recipe calls for olive oil and garlic.",
        cleaned_text="The recipe calls for olive oil and garlic.",
    )
    res_clean = await apk_profiler.analyze(ctx_clean)
    assert res_clean.score == 0.0
    assert res_clean.verdict == Verdict.SAFE


@pytest.mark.asyncio
async def test_voice_verifier_detection():
    # 1. Digital arrest coercion
    digital_arrest = "This is CBI customs cyber police officer speaking. You are under digital arrest. FIR registered. Do not disconnect the video call."
    ctx_arrest = ScanContext(
        scan_id="voice-1",
        raw_text=digital_arrest,
        cleaned_text=digital_arrest,
    )
    res_arrest = await voice_verifier.analyze(ctx_arrest)
    assert res_arrest.score >= 0.85
    assert res_arrest.verdict == Verdict.DANGEROUS
    assert any("DIGITAL_ARREST_COERCION" in e.code for e in res_arrest.evidence)

    # 2. Family distress bail extortion with audio filename
    bail_call = "Papa I am arrested in police custody after an accident. Please wire transfer bail money to lawyer urgent save me!"
    ctx_bail = ScanContext(
        scan_id="voice-2",
        raw_text=bail_call,
        cleaned_text=bail_call,
        file_name="urgent_voicemail.mp3",
    )
    res_bail = await voice_verifier.analyze(ctx_bail)
    assert res_bail.score >= 0.90
    assert any("FAMILY_BAIL_KIDNAP_EXTORTION" in e.code for e in res_bail.evidence)
    assert res_bail.indicators["audio_file_detected"] is True
    assert res_bail.indicators["synthetic_spoof_likelihood"] > 0.0

    # 3. Benign text
    ctx_benign = ScanContext(
        scan_id="voice-3",
        raw_text="Good morning, could you send the meeting notes from yesterday?",
        cleaned_text="Good morning, could you send the meeting notes from yesterday?",
    )
    res_benign = await voice_verifier.analyze(ctx_benign)
    assert res_benign.score == 0.0
    assert res_benign.verdict == Verdict.SAFE
