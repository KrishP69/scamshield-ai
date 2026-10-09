import pytest
from fastapi.testclient import TestClient
from apps.api.app.main import app
from app.modules.screenshot_inspector import inspect_screenshot_banner, generate_preset_screenshot


client = TestClient(app)


def test_instagram_game_phishing_preset():
    result = inspect_screenshot_banner(preset="instagram_game_phishing")
    assert result["verdict"] == "CRITICAL"
    assert result["risk_score"] >= 90
    assert result["credential_theft_detected"] is True
    assert result["absurd_deal_detected"] is True
    assert result["threat_category"] == "GAME_REWARD_CREDENTIAL_TRAP"
    assert "Instagram" in result["target_platforms"]
    assert len(result["red_flags"]) >= 2
    assert len(result["threat_zones"]) >= 1
    assert len(result["attack_anatomy"]) == 4
    assert result["preview_image_url"].startswith("data:image/png;base64,")


def test_instagram_copyright_phishing_preset():
    result = inspect_screenshot_banner(preset="instagram_copyright_strike")
    assert result["verdict"] == "CRITICAL"
    assert result["risk_score"] >= 90
    assert result["credential_theft_detected"] is True
    assert result["threat_category"] == "INSTAGRAM_ACCOUNT_TAKEOVER"
    assert "Instagram" in result["target_platforms"]


def test_iphone_lottery_giveaway_preset():
    result = inspect_screenshot_banner(preset="iphone_lottery_giveaway")
    assert result["verdict"] in ("CRITICAL", "HIGH")
    assert result["risk_score"] >= 80
    assert result["absurd_deal_detected"] is True
    assert result["threat_category"] == "ABSURD_GIVEAWAY_LOTTERY"


def test_task_job_scam_preset():
    result = inspect_screenshot_banner(preset="task_like_reels_job")
    assert result["verdict"] in ("CRITICAL", "HIGH")
    assert result["risk_score"] >= 80
    assert result["threat_category"] == "TASK_JOB_FRAUD"


def test_legitimate_game_update_preset():
    result = inspect_screenshot_banner(preset="legitimate_game_update")
    assert result["verdict"] == "SAFE"
    assert result["risk_score"] < 25
    assert result["credential_theft_detected"] is False
    assert result["threat_category"] == "LEGITIMATE_PROMOTION"


def test_custom_screenshot_with_text_hint():
    # Simulate a user screenshot with custom text hint describing a game diamond phishing trap
    raw_dummy = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    result = inspect_screenshot_banner(
        image_bytes=raw_dummy,
        text_hint="FREE 10,000 FREE FIRE DIAMONDS! Enter your Instagram login ID and password to claim your rewards now!",
        filename="fishy_banner.png",
    )
    assert result["verdict"] == "CRITICAL"
    assert result["risk_score"] >= 90
    assert result["credential_theft_detected"] is True
    assert result["absurd_deal_detected"] is True
    assert "Instagram" in result["target_platforms"]


def test_api_screenshot_inspector_endpoint_preset():
    response = client.post(
        "/api/v1/scans/screenshot-inspector",
        data={"preset": "instagram_game_phishing"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "CRITICAL"
    assert data["risk_score"] >= 90
    assert data["credential_theft_detected"] is True
    assert "preview_image_url" in data
    assert "attack_anatomy" in data


def test_api_screenshot_inspector_endpoint_missing_payload():
    response = client.post("/api/v1/scans/screenshot-inspector", data={})
    assert response.status_code == 400
