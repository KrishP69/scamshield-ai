import pytest
from app.modules.base import ScanContext
from app.modules.crypto_detector.service import crypto_detector
from app.modules.crypto_detector.validators import validate_bitcoin_address, validate_ethereum_eip55, validate_tron_address


def test_crypto_address_validation():
    # Valid Ethereum address
    is_valid, _ = validate_ethereum_eip55("0x71C95911E9a5D330f4d621842EC243EE1343292e")
    assert is_valid

    # Valid Bitcoin address
    is_btc, _ = validate_bitcoin_address("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")
    assert is_btc

    # Invalid TRON address (too short)
    is_tron, _ = validate_tron_address("T123Short")
    assert not is_tron


@pytest.mark.asyncio
async def test_crypto_scam_detection():
    text = (
        "Send 1 ETH to 0x71C95911E9a5D330f4d621842EC243EE1343292e to receive 3X back! "
        "Guaranteed 300% instant returns. Enter your 12-word seed phrase."
    )
    ctx = ScanContext(
        scan_id="test-crypto-1",
        raw_text=text,
        cleaned_text=text,
        entities={"wallets": [{"address": "0x71C95911E9a5D330f4d621842EC243EE1343292e", "chain": "ethereum"}]},
    )
    finding = await crypto_detector.analyze(ctx)
    assert finding.module == "crypto_detector"
    assert finding.score >= 0.95
    assert finding.verdict.value == "dangerous"

    codes = [e.code for e in finding.evidence]
    assert "KNOWN_SCAM_WALLET" in codes
    assert "SEED_PHRASE_DEMAND" in codes
    assert "MULTIPLIER_GIVEAWAY_FRAUD" in codes
