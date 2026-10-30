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

    try:
        parsed = urlparse(current_url)
        domain = (parsed.hostname or "").lower()
    except Exception:
        domain = ""

    if domain in KNOWN_SHORTENERS:
        is_shortener = True

    # Pre-flight check: if the starting target itself is an SSRF risk, NEVER make outbound requests!
    ssrf_initial = detect_ssrf_and_ip_host(domain) if domain else {"is_ssrf_risk": False}
    if ssrf_initial.get("is_ssrf_risk"):
        return {
            "original_url": url,
            "final_url": current_url,
            "is_shortener": is_shortener,
            "has_redirects": False,
            "hop_count": 0,
            "hops": hops,
            "is_ssrf_blocked": True,
            "detection_method": "SSRF & Private Subnet Isolation Guard",
        }

    try:
        async with httpx.AsyncClient(
            follow_redirects=False,
            timeout=3.5,
            verify=True,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        ) as client:
            for _ in range(max_hops):
                # SSRF guard on current hop before sending request
                try:
                    parsed_hop = urlparse(current_url)
                    hop_host = parsed_hop.hostname or ""
                except Exception:
                    break

                ssrf_res = detect_ssrf_and_ip_host(hop_host)
                if ssrf_res.get("is_ssrf_risk"):
                    break

                try:
                    resp = await client.head(current_url)
                    # Some servers reject HEAD; fallback to GET with stream=True so body isn't downloaded
                    if resp.status_code in (405, 403, 501):
                        resp = await client.get(current_url)
                except Exception:
                    break

                if resp.status_code in (301, 302, 303, 307, 308):
                    location = resp.headers.get("Location")
                    if not location:
                        break
                    # Handle relative redirect
                    from urllib.parse import urljoin
                    location = urljoin(current_url, location)
                    
                    try:
                        next_host = (urlparse(location).hostname or "").lower()
                    except Exception:
                        break

                    next_ssrf = detect_ssrf_and_ip_host(next_host)
                    if next_ssrf.get("is_ssrf_risk"):
                        hops.append(location)
                        current_url = location
                        break

                    current_url = location
                    hops.append(current_url)
                else:
                    break
    except Exception:
        # Fall back to original url if network unreachable
        pass

    final_url = hops[-1]
    has_redirects = len(hops) > 1

    try:
        dest_netloc = urlparse(final_url).netloc or final_url
    except Exception:
        dest_netloc = final_url

    return {
        "original_url": url,
        "final_url": final_url,
        "is_shortener": is_shortener,
        "has_redirects": has_redirects,
        "hop_count": len(hops) - 1,
        "hops": hops,
        "detection_method": (
            f"Redirect Chain Unshortening & Hidden Destination Unmasking ({len(hops)-1} hops -> {dest_netloc})"
            if (is_shortener or has_redirects)
            else None
        ),
    }
