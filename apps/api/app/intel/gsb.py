from typing import Any, Dict, List
import httpx
from app.core.config import settings
from app.intel.base import cache


class GoogleSafeBrowsingAdapter:
    """Google Safe Browsing v4/v5 API adapter with TTL caching and honest offline fallback."""

    def __init__(self):
        self.api_key = settings.GOOGLE_SAFE_BROWSING_KEY
        self.endpoint = "https://safebrowsing.googleapis.com/v4/threatMatches:find"

    async def lookup_url(self, url: str) -> Dict[str, Any]:
        cache_key = f"gsb:{url}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        if not self.api_key:
            res = {
                "is_threat": False,
                "threat_types": [],
                "status": "offline_fallback",
                "source": "offline_fallback",
            }
            cache.set(cache_key, res, ttl=300)
            return res

        payload = {
            "client": {
                "clientId": "scamshield-ai",
                "clientVersion": settings.VERSION,
            },
            "threatInfo": {
                "threatTypes": [
                    "MALWARE",
                    "SOCIAL_ENGINEERING",
                    "UNWANTED_SOFTWARE",
                    "POTENTIALLY_HARMFUL_APPLICATION",
                ],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}],
            },
        }

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.post(f"{self.endpoint}?key={self.api_key}", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    matches = data.get("matches", [])
                    is_threat = len(matches) > 0
                    threat_types = [m.get("threatType") for m in matches]
                    result = {
                        "is_threat": is_threat,
                        "threat_types": threat_types,
                        "status": "online",
                        "source": "external_api",
                    }
                    cache.set(cache_key, result, ttl=3600)
                    return result
                else:
                    return {
                        "is_threat": False,
                        "threat_types": [],
                        "status": f"api_error_{resp.status_code}",
                        "source": "offline_fallback",
                    }
        except Exception:
            return {
                "is_threat": False,
                "threat_types": [],
                "status": "offline_fallback_timeout",
                "source": "offline_fallback",
            }


gsb_adapter = GoogleSafeBrowsingAdapter()
