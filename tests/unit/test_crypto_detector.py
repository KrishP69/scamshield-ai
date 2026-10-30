import pytest
from app.modules.base import ScanContext
from app.modules.crypto_detector.service import crypto_detector
from app.modules.crypto_detector.validators import (
    validate_bitcoin_address,
    validate_ethereum_eip55,
    validate_tron_address,
)


def test_crypto_address_validation():
    # Ethereum valid EIP-55
    valid_eth = "0x71C95911E9a5D330F4d621842EC243EE1343292e"
    is_valid, _ = validate_ethereum_eip55(valid_eth)
    assert is_valid is True

    # Bitcoin Genesis legacy
    btc_genesis = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    is_btc, _ = validate_bitcoin_address(btc_genesis)
    assert is_btc is True

    # Tron format
    tron_addr = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
    is_tron, _ = validate_tron_address(tron_addr)
    assert is_tron is True


@pytest.mark.asyncio
async def test_crypto_scam_detection():
    # Multiplier trap and seed phrase demand
    msg = "Send 1 ETH to smart contract pool and receive 2X back instantly! Or enter your 12-word seed phrase."
    ctx = ScanContext(scan_id="test-crypto-1", raw_text=msg)
    finding = await crypto_detector.analyze(ctx)

    assert finding.module == "crypto_detector"
    assert finding.score >= 0.90
    assert finding.verdict.value == "dangerous"
    codes = [e.code for e in finding.evidence]
    assert "SEED_PHRASE_DEMAND" in codes
    assert "MULTIPLIER_GIVEAWAY_FRAUD" in codes

