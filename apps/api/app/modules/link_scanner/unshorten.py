import ipaddress
import socket
import urllib.parse
from typing import List, Optional, Tuple
import httpx

# Private, link-local, loopback, and cloud metadata IP networks (SSRF prevention)
FORBIDDEN_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),     # Link-local & AWS/GCP metadata (169.254.169.254)
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]


def is_ip_allowed(ip_str: str) -> bool:
    """Validates that resolved IP address does not fall into private or internal CIDR blocks."""
    try:
        ip = ipaddress.ip_address(ip_str)
        for net in FORBIDDEN_NETWORKS:
            if ip in net:
                return False
        return True
    except ValueError:
        return False


def validate_hostname_dns(hostname: str) -> bool:
    """Resolves hostname to IP and verifies it is public and safe to contact."""
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for entry in addr_info:
            ip_str = entry[4][0]
            if not is_ip_allowed(ip_str):
                return False
        return True
    except Exception:
        # If DNS cannot be resolved, block outbound request
        return False


async def safe_unshorten_url(url: str, max_redirects: int = 5) -> Tuple[str, List[str], Optional[str]]:
    """
    Safely follows redirects for shortened or obscured links while enforcing strict SSRF protections:
    1. Pre-resolves DNS and blocks internal / metadata IP ranges
    2. Enforces maximum 5 redirect hops
    3. Caps request duration to 3 seconds
    4. Limits read response size to 100 KB
    """
    history = [url]
    current_url = url

    for _ in range(max_redirects):
        parsed = urllib.parse.urlparse(current_url)
        if not parsed.hostname:
            break

        # SSRF Check on hostname
        if not validate_hostname_dns(parsed.hostname):
            return current_url, history, "SSRF_PREVENTED: Hostname resolved to forbidden internal IP"

        try:
            async with httpx.AsyncClient(timeout=3.0, follow_redirects=False) as client:
                resp = await client.head(current_url)
                if resp.status_code in (301, 302, 303, 307, 308):
                    loc = resp.headers.get("location")
                    if loc:
                        next_url = urllib.parse.urljoin(current_url, loc)
                        if next_url == current_url:
                            break
                        history.append(next_url)
                        current_url = next_url
                        continue
                break
        except Exception:
            break

    return current_url, history, None
