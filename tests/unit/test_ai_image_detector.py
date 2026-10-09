import pytest
import io
import numpy as np
from PIL import Image, ImageFilter
from fastapi.testclient import TestClient
from app.main import app
from app.modules.ai_image_detector.detector import (
    analyze_fft_spectrum,
    analyze_ela,
    analyze_noise_and_edges,
    detect_ai_generated_image,
)

client = TestClient(app)


def test_ai_detector_fft_and_ela_helpers():
    # Synthetic grid pattern
    w, h = 256, 256
    y, x = np.mgrid[:h, :w]
    synth_arr = (((x % 16 == 0) | (y % 16 == 0)) * 200).astype(np.uint8)

    score, heatmap = analyze_fft_spectrum(synth_arr)
    assert score > 0.5
    assert heatmap.startswith("data:image/png;base64,")

    # Natural smooth gradient
    pil_img = Image.new("RGB", (256, 256), color=(128, 128, 128))
    ela_score, ela_heatmap = analyze_ela(pil_img)
    assert isinstance(ela_score, float)
    assert ela_heatmap.startswith("data:image/png;base64,")


def test_ai_detector_authentic_sample():
    # Create smooth organic image with natural noise
    w, h = 256, 256
    y, x = np.mgrid[:h, :w]
    scene = np.sin(x / 30.0) * 40.0 + (y * 0.3) + 100.0
    img_scene = Image.fromarray(np.clip(scene, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=2))
    scene_arr = np.array(img_scene, dtype=np.float32)
    noise = np.random.normal(0, 2.0, (h, w)).astype(np.float32)

    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for c in range(3):
        arr[:, :, c] = np.clip(scene_arr + noise, 0, 255).astype(np.uint8)

    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="JPEG", quality=95)
    result = detect_ai_generated_image(buf.getvalue(), filename="authentic_photo.jpg")

    assert result["is_ai_generated"] is False
    assert result["risk_level"] == "SAFE"
    assert "AUTHENTIC" in result["verdict"]
    assert "fft_heatmap_url" in result
    assert "forensic_metrics" in result


def test_ai_detector_synthetic_sample():
    # Synthetic periodic lattice grid typical of generative diffusion
    w, h = 512, 512
    y, x = np.mgrid[:h, :w]
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    arr[:, :, 0] = np.clip(180 - np.sqrt((x-256)**2 + (y-256)**2) * 0.5, 0, 255)
    lattice = ((x % 16 == 0) | (y % 16 == 0)).astype(np.uint8) * 35
    arr[:, :, 0] = np.clip(arr[:, :, 0] + lattice, 0, 255)
    arr[:, :, 1] = np.clip(120 + lattice, 0, 255)

    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="JPEG", quality=92)
    result = detect_ai_generated_image(buf.getvalue(), filename="midjourney_profile.jpg")

    assert result["is_ai_generated"] is True
    assert result["ai_probability"] >= 60.0
    assert result["risk_level"] in ("CRITICAL", "CAUTION")
    assert "Diffusion" in result["generator_fingerprint"] or "GAN" in result["generator_fingerprint"]


def test_api_ai_image_preset_endpoint():
    res_mj = client.post("/api/v1/scans/ai-image", data={"preset": "midjourney_profile"})
    assert res_mj.status_code == 200
    data_mj = res_mj.json()
    assert data_mj["is_ai_generated"] is True
    assert data_mj["ai_probability"] >= 50.0

    res_auth = client.post("/api/v1/scans/ai-image", data={"preset": "authentic_camera"})
    assert res_auth.status_code == 200
    data_auth = res_auth.json()
    assert data_auth["is_ai_generated"] is False
    assert data_auth["risk_level"] == "SAFE"


def test_api_ai_image_missing_payload():
    res = client.post("/api/v1/scans/ai-image", data={})
    assert res.status_code == 400
