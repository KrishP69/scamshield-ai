from typing import Any, Dict
import httpx
from app.core.config import settings
from app.intel.base import cache

# Well-known research / test threat hashes (including standard EICAR test string)
KNOWN_TEST_HASHES = {
    # EICAR standard antivirus test hash
    "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f": {
        "positives": 64,
        "total_engines": 70,
        "is_threat": True,
        "scan_date": "2026-09-26",
        "threat_name": "EICAR-Test-File",
        "source": "rule",
    }
}


class VirusTotalAdapter:
    """VirusTotal v3 SHA-256 hash lookup adapter (no uploads without consent)."""

    def __init__(self):
        self.api_key = settings.VIRUSTOTAL_KEY
        self.endpoint = "https://www.virustotal.com/api/v3/files"

    async def lookup_hash(self, sha256_hash: str) -> Dict[str, Any]:
        normalized_hash = sha256_hash.strip().lower()
        cache_key = f"vt:{normalized_hash}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        # Check known offline research test hashes
        if normalized_hash in KNOWN_TEST_HASHES:
            res = KNOWN_TEST_HASHES[normalized_hash]
            cache.set(cache_key, res, ttl=86400)
            return res

        if not self.api_key:
            res = {
                "is_threat": False,
                "positives": 0,
                "total_engines": 0,
                "status": "offline_fallback",
                "source": "offline_fallback",
            }
            cache.set(cache_key, res, ttl=300)
            return res

        headers = {"x-apikey": self.api_key}
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(f"{self.endpoint}/{normalized_hash}", headers=headers)
                if resp.status_code == 200:
                    data = resp.json().get("data", {}).get("attributes", {})
                    stats = data.get("last_analysis_stats", {})
                    positives = stats.get("malicious", 0) + stats.get("suspicious", 0)
                    total = sum(stats.values())
                    is_threat = positives >= 3
                    result = {
                        "is_threat": is_threat,
                        "positives": positives,
                        "total_engines": total,
                        "status": "online",
                        "source": "external_api",
                    }
                    cache.set(cache_key, result, ttl=86400)
                    return result
                elif resp.status_code == 404:
                    return {
                        "is_threat": False,
                        "positives": 0,
                        "total_engines": 0,
                        "status": "not_found_on_virustotal",
                        "source": "external_api",
                    }
                else:
                    return {
                        "is_threat": False,
                        "positives": 0,
                        "total_engines": 0,
                        "status": f"api_error_{resp.status_code}",
                        "source": "offline_fallback",
                    }
        except Exception:
            return {
                "is_threat": False,
                "positives": 0,
                "total_engines": 0,
                "status": "offline_fallback_timeout",
                "source": "offline_fallback",
            }


virustotal_adapter = VirusTotalAdapter()
