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
