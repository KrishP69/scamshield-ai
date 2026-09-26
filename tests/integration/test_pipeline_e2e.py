import json
from pathlib import Path
import pytest


def load_fixture(fixture_name: str) -> dict:
    repo_root = Path(__file__).resolve().parent.parent.parent
    fixture_path = repo_root / "datasets" / "demo_scenarios" / fixture_name
    with open(fixture_path, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.mark.asyncio
async def test_scenario_1_marketplace_advance_payment(client):
    """End-to-End Test: Demo Scenario 1 — Facebook Marketplace Army Advance Payment Fraud."""
    fixture = load_fixture("scenario_1_marketplace.json")
    payload = {
        "text": fixture["input_data"]["text"],
        "platform": fixture["platform"],
        "store_history": False,
    }

    response = await client.post("/api/v1/scans", json=payload)
    assert response.status_code == 202
    data = response.json()
    assert "scan_id" in data

    passport = data["passport"]
    assert passport is not None
    assert passport["risk_score"] >= fixture["expected_passport"]["risk_score_min"]
    assert passport["level"] in ("HIGH", "CRITICAL")
    assert passport["scam_type"] == fixture["expected_passport"]["scam_type"]

    # Verify explainable reasons
    reason_codes = [r["code"] for r in passport["reasons"]]
    for expected_tactic in fixture["expected_passport"]["expected_tactics"]:
        assert expected_tactic.upper() in reason_codes, f"Expected {expected_tactic} in reasons: {reason_codes}"

    # Verify word highlight span exists
    has_spans = any(r.get("span") is not None for r in passport["reasons"])
    assert has_spans, "At least one reason must have character span offsets for inline highlight sync"

    # Verify recommended defensive actions
    assert len(passport["actions"]) >= 2
    assert any("1930" in a or "advance" in a.lower() for a in passport["actions"])


@pytest.mark.asyncio
async def test_control_1_genuine_seller(client):
    """End-to-End Test: Safe Control 1 — Genuine Marketplace Seller Inquiry."""
    fixture = load_fixture("control_1_genuine_seller.json")
    payload = {
        "text": fixture["input_data"]["text"],
        "platform": fixture["platform"],
        "store_history": False,
    }

    response = await client.post("/api/v1/scans", json=payload)
    assert response.status_code == 202
    data = response.json()
    passport = data["passport"]

    assert passport["risk_score"] <= fixture["expected_passport"]["risk_score_max"]
    assert passport["level"] == "LOW"
    assert passport["scam_type"] == "legit"


@pytest.mark.asyncio
async def test_sse_stream_events(client):
    """Verifies that the SSE stream endpoint emits progress and completion events."""
    # First create a scan
    payload = {"text": "Quick test message for SSE streaming", "platform": "facebook"}
    create_res = await client.post("/api/v1/scans", json=payload)
    scan_id = create_res.json()["scan_id"]

    # Stream events from SSE endpoint
    stream_res = await client.get(f"/api/v1/scans/{scan_id}/stream")
    assert stream_res.status_code == 200
    assert "text/event-stream" in stream_res.headers["content-type"]

    # Collect body chunks
    body_text = stream_res.text
    assert "data:" in body_text
    assert "risk_score" in body_text
    assert "passport" in body_text


@pytest.mark.asyncio
async def test_scenario_2_cloned_profile(client):
    """End-to-End Test: Demo Scenario 2 — Cloned Profile & Friend Impersonation."""
    fixture = load_fixture("scenario_2_cloned_profile.json")
    payload = {
        "text": fixture["input_data"]["text"],
        "platform": fixture["platform"],
        "phone": fixture["input_data"].get("phone"),
        "photo_phash": "8f8f8e8e1c1c1c1c",
    }
    response = await client.post("/api/v1/scans", json=payload)
    assert response.status_code == 202
    passport = response.json()["passport"]

    assert passport["risk_score"] >= fixture["expected_passport"]["risk_score_min"]
    assert passport["level"] in ("HIGH", "CRITICAL")
    assert passport["scam_type"] in ("cloned_friend_account", "marketplace_advance_payment")

    reason_codes = [r["code"] for r in passport["reasons"]]
    assert "EMOTIONAL_PRESSURE" in reason_codes or "IMPERSONATION_OF_KNOWN_PERSON" in reason_codes
    assert any("RECYCLED_SCAM_PHOTO" in r["code"] for r in passport["reasons"])


@pytest.mark.asyncio
async def test_scenario_3_phishing_link(client):
    """End-to-End Test: Demo Scenario 3 — Look-Alike Phishing Domain."""
    fixture = load_fixture("scenario_3_phishing_link.json")
    payload = {
        "text": fixture["input_data"]["text"],
        "platform": fixture["platform"],
        "url": fixture["input_data"]["url"],
    }
    response = await client.post("/api/v1/scans", json=payload)
    assert response.status_code == 202
    passport = response.json()["passport"]

    assert passport["risk_score"] >= fixture["expected_passport"]["risk_score_min"]
    assert passport["level"] == "CRITICAL"
    reason_codes = [r["code"] for r in passport["reasons"]]
    assert any("LOOKALIKE_BRAND_DOMAIN" in c or "CONFIRMED_MALICIOUS_URL" in c or "HIGH_RISK_TLD" in c for c in reason_codes)
    assert len(passport["indicators"]["urls"]) >= 1


@pytest.mark.asyncio
async def test_scenario_4_telegram_crypto(client):
    """End-to-End Test: Demo Scenario 4 — Telegram Fake Crypto Giveaway / Seed Phrase."""
    fixture = load_fixture("scenario_4_telegram_crypto.json")
    payload = {
        "text": fixture["input_data"]["text"],
        "platform": fixture["platform"],
        "wallet_address": fixture["input_data"]["wallet_address"],
    }
    response = await client.post("/api/v1/scans", json=payload)
    assert response.status_code == 202
    passport = response.json()["passport"]

    assert passport["risk_score"] >= fixture["expected_passport"]["risk_score_min"]
    assert passport["level"] == "CRITICAL"
    reason_codes = [r["code"] for r in passport["reasons"]]
    assert any("SEED_PHRASE" in c or "KNOWN_SCAM_WALLET" in c or "MULTIPLIER" in c or "TOO_GOOD_TO_BE_TRUE" in c for c in reason_codes)
    assert len(passport["indicators"]["wallets"]) >= 1


@pytest.mark.asyncio
async def test_scenario_5_suspicious_apk(client):
    """End-to-End Test: Demo Scenario 5 — Malicious Banking APK Permissions."""
    fixture = load_fixture("scenario_5_suspicious_apk.json")
    payload = {
        "text": "Please install this SBI rewards update apk",
        "platform": fixture["platform"],
        "file_name": fixture["input_data"]["file_name"],
        "sha256": fixture["input_data"]["sha256"],
        "package_name": fixture["input_data"]["package_name"],
        "permissions": fixture["input_data"]["permissions"],
    }
    response = await client.post("/api/v1/scans", json=payload)
    assert response.status_code == 202
    passport = response.json()["passport"]

    assert passport["risk_score"] >= fixture["expected_passport"]["risk_score_min"]
    assert passport["level"] == "CRITICAL"
    reason_codes = [r["code"] for r in passport["reasons"]]
    assert any("VIRUSTOTAL_MALWARE_HIT" in c or "DANGEROUS_PERMISSIONS_COMBO" in c or "PACKAGE_NAME" in c for c in reason_codes)


@pytest.mark.asyncio
async def test_control_2_bank_otp(client):
    """End-to-End Test: Safe Control 2 — Authentic Bank Transaction Alert."""
    fixture = load_fixture("control_2_bank_otp.json")
    payload = {
        "text": fixture["input_data"]["text"],
        "platform": fixture["platform"],
    }
    response = await client.post("/api/v1/scans", json=payload)
    assert response.status_code == 202
    passport = response.json()["passport"]

    assert passport["risk_score"] <= fixture["expected_passport"]["risk_score_max"]
    assert passport["level"] == "LOW"
    assert passport["scam_type"] == "legit"
