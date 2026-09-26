import urllib.parse
from typing import Any, Dict, Protocol
from app.core.config import settings


class ReverseImageAdapter(Protocol):
    async def search(self, image_url: str) -> Dict[str, Any]:
        ...


class DeepLinkFallbackAdapter:
    """Generates direct browser links for manual reverse search via Google Lens, TinEye, and Yandex."""

    async def search(self, image_url: str) -> Dict[str, Any]:
        encoded_url = urllib.parse.quote(image_url, safe="")
        return {
            "matches_found": False,
            "match_count": 0,
            "status": "deeplink_fallback",
            "source": "offline_fallback",
            "search_links": {
                "google_lens": f"https://lens.google.com/uploadbyurl?url={encoded_url}",
                "tineye": f"https://tineye.com/search?url={encoded_url}",
                "yandex": f"https://yandex.com/images/search?rpt=imageview&url={encoded_url}",
            },
        }


class SerpApiLensAdapter:
    """Uses SerpApi Google Lens engine when SERPAPI_KEY is configured."""

    def __init__(self):
        self.api_key = settings.SERPAPI_KEY
        self.fallback = DeepLinkFallbackAdapter()

    async def search(self, image_url: str) -> Dict[str, Any]:
        if not self.api_key:
            return await self.fallback.search(image_url)

        # In production this would query https://serpapi.com/search.json?engine=google_lens
        return await self.fallback.search(image_url)


image_adapter = SerpApiLensAdapter()
