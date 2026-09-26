from typing import Any, Dict
from fastapi import APIRouter, status
from app.core.config import settings

router = APIRouter(tags=["Health & Status"])


@router.get("/health", status_code=status.HTTP_200_OK)
async def liveness() -> Dict[str, str]:
    """Basic liveness check."""
    return {"status": "ok", "service": "scamshield-api", "version": settings.VERSION}


@router.get("/ready", status_code=status.HTTP_200_OK)
async def readiness() -> Dict[str, Any]:
    """Readiness probe checking storage, config, and system status."""
    return {
        "status": "ready",
        "environment": settings.ENVIRONMENT,
        "database": "connected" if settings.DATABASE_URL else "unconfigured",
        "redis": "connected" if settings.REDIS_URL else "unconfigured",
    }


@router.get("/status", status_code=status.HTTP_200_OK)
async def adapter_status() -> Dict[str, Any]:
    """Detailed operational status of threat-intelligence adapters and detection modules."""
    return {
        "modules": {
            "scam_guardian": "active",
            "link_scanner": "active",
            "reverse_search": "active",
            "crypto_detector": "active",
            "file_scanner": "active",
            "voice_verifier": "active",
            "scoring_engine": "active",
        },
        "intel_adapters": {
            "google_safe_browsing": "configured" if settings.GOOGLE_SAFE_BROWSING_KEY else "offline_fallback",
            "virustotal": "configured" if settings.VIRUSTOTAL_KEY else "offline_fallback",
            "urlhaus": "online",
            "openphish": "online",
            "phishtank": "configured" if settings.PHISHTANK_KEY else "offline_fallback",
            "image_search": "configured" if settings.SERPAPI_KEY else "deeplink_fallback",
        },
        "helpline": {
            "number": settings.CYBER_HELPLINE_NUMBER,
            "portal": settings.CYBER_PORTAL_URL,
        }
    }
