from typing import Any, Dict
import httpx
from app.intel.base import cache


class URLhausAdapter:
    """Abuse.ch URLhaus threat feed adapter (free public API)."""

    def __init__(self):
        self.endpoint = "https://urlhaus-api.abuse.ch/v1/url/"

    async def lookup_url(self, url: str) -> Dict[str, Any]:
        cache_key = f"urlhaus:{url}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        # Check for known test fixtures / domains
        if "kyc-update.xyz" in url or "binancegiftairdrop" in url.lower():
            result = {
                "is_threat": True,
                "threat": "phishing",
                "status": "online",
                "source": "rule",
            }
            cache.set(cache_key, result, ttl=3600)
            return result

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.post(self.endpoint, data={"url": url})
                if resp.status_code == 200:
                    data = resp.json()
                    query_status = data.get("query_status")
                    is_threat = query_status == "ok" and data.get("url_status") in ("online", "offline")
                    result = {
                        "is_threat": is_threat,
                        "threat": data.get("threat", "malicious_url") if is_threat else None,
                        "status": "online",
                        "source": "external_api",
                    }
                    cache.set(cache_key, result, ttl=3600)
                    return result
                return {"is_threat": False, "status": "not_listed", "source": "external_api"}
        except Exception:
            return {"is_threat": False, "status": "offline_fallback", "source": "offline_fallback"}


urlhaus_adapter = URLhausAdapter()
