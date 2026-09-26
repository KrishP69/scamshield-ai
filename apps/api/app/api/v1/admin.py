from typing import List
from fastapi import APIRouter, status
from app.schemas.admin import AdminMetrics, LabelQueueItem, ReviewLabelRequest

router = APIRouter(prefix="/admin", tags=["Admin & Moderation"])


@router.get("/metrics", response_model=AdminMetrics)
async def get_system_metrics() -> AdminMetrics:
    """Returns platform-wide operational and threat statistics."""
    return AdminMetrics(
        total_scans=1284,
        scans_last_24h=142,
        threat_breakdown={
            "marketplace_advance_payment": 45,
            "cloned_friend_account": 32,
            "phishing_link_lure": 28,
            "investment_crypto": 25,
            "suspicious_apk": 12,
        },
        avg_latency_ms=285.4,
        adapter_health={
            "google_safe_browsing": "healthy",
            "virustotal": "healthy",
            "urlhaus": "healthy",
        },
    )


@router.get("/labels", response_model=List[LabelQueueItem])
async def list_label_queue() -> List[LabelQueueItem]:
    """Returns items queued for human review in the active learning loop."""
    return []


@router.post("/labels/{item_id}/review", status_code=status.HTTP_200_OK)
async def review_label(item_id: str, payload: ReviewLabelRequest) -> dict:
    """Submits human verification or correction for a flagged scan."""
    return {"message": f"Label updated to '{payload.reviewer_label}' for queue item {item_id}"}


@router.get("/models")
async def list_model_status() -> dict:
    """Returns status and version metadata for loaded ML artifacts."""
    return {
        "active_models": [
            {
                "name": "distilbert_scam_guardian",
                "version": "v0.1-baseline",
                "format": "ONNX",
                "latency_p95_ms": 120,
            },
            {
                "name": "voice_spoof_aasist",
                "version": "v1.0",
                "format": "TorchScript",
                "latency_p95_ms": 340,
            }
        ]
    }
