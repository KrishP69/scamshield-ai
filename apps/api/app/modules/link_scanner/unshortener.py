import asyncio
from typing import Any, Dict, List
from urllib.parse import urlparse
import httpx
from app.modules.link_scanner.ssrf import detect_ssrf_and_ip_host

KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy",
    "ow.ly", "qr.ae", "shorturl.at", "t.ly", "buff.ly", "rebrand.ly",
    "shorte.st", "adf.ly", "bc.vc", "soo.gd", "v.gd"
}


async def unshorten_url(url: str, max_hops: int = 5) -> Dict[str, Any]:
    """
    Safely expands URL redirects to uncover the hidden landing destination.
    Guarded with SSRF checks on each hop to prevent internal probing.
    """
    current_url = url
    if not current_url.startswith(("http://", "https://")):
        current_url = "https://" + current_url

    hops: List[str] = [current_url]
    is_shortener = False

    parsed = urlparse(current_url)
    domain = (parsed.hostname or "").lower()
    if domain in KNOWN_SHORTENERS:
        is_shortener = True

    try:
        async with httpx.AsyncClient(
            follow_redirects=False,
            timeout=3.5,
            verify=False,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        ) as client:
            for _ in range(max_hops):
                # SSRF guard on intermediate hops
                parsed_hop = urlparse(current_url)
                hop_host = parsed_hop.hostname or ""
                ssrf_res = detect_ssrf_and_ip_host(hop_host)
                if ssrf_res["is_ssrf_risk"]:
                    hops.append(f"[BLOCKED_SSRF_REDIRECT: {current_url}]")
                    break

                try:
                    resp = await client.head(current_url)
                    # Some servers reject HEAD; fallback to GET with stream=True so body isn't downloaded
                    if resp.status_code in (405, 403, 501):
                        resp = await client.get(current_url)
                except httpx.RequestError:
                    break

                if resp.status_code in (301, 302, 303, 307, 308):
                    location = resp.headers.get("Location")
                    if not location:
                        break
                    # Handle relative redirect
                    if location.startswith("/"):
                        location = f"{parsed_hop.scheme}://{parsed_hop.netloc}{location}"
                    current_url = location
                    hops.append(current_url)
                else:
                    break
    except Exception:
        # Fall back to original url if network unreachable
        pass

    final_url = hops[-1]
    has_redirects = len(hops) > 1

    return {
        "original_url": url,
        "final_url": final_url,
        "is_shortener": is_shortener,
        "has_redirects": has_redirects,
        "hop_count": len(hops) - 1,
        "hops": hops,
        "detection_method": (
            f"Redirect Chain Unshortening & Hidden Destination Unmasking ({len(hops)-1} hops -> {urlparse(final_url).netloc})"
            if (is_shortener or has_redirects)
            else None
        ),
    }
