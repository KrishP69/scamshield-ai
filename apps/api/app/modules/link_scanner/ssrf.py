import ipaddress
import re
from typing import Any, Dict, Optional
from urllib.parse import urlparse

# Private IPv4 & IPv6 networks according to RFC 1918, RFC 3927, RFC 4193, etc.
RESTRICTED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),      # Loopback
    ipaddress.ip_network("10.0.0.0/8"),       # RFC 1918 Private
    ipaddress.ip_network("172.16.0.0/12"),    # RFC 1918 Private
    ipaddress.ip_network("192.168.0.0/16"),   # RFC 1918 Private
    ipaddress.ip_network("169.254.0.0/16"),   # Link-Local (Cloud metadata: AWS/GCP 169.254.169.254)
    ipaddress.ip_network("224.0.0.0/4"),      # Multicast
    ipaddress.ip_network("::1/128"),          # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),         # IPv6 unique local
    ipaddress.ip_network("fe80::/10"),        # IPv6 link-local
]

# Patterns for non-standard IP formats (hex, octal, single-integer dword)
HEX_IP_PATTERN = re.compile(r"^0x[0-9a-fA-F]+(?:\.0x[0-9a-fA-F]+)*$")
OCTAL_IP_PATTERN = re.compile(r"^0[0-7]+(?:\.0[0-7]+)*$")
DWORD_IP_PATTERN = re.compile(r"^\d{8,11}$")


def parse_ip_address(host: str) -> Optional[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    """
    Tries to resolve host into an IP address, handling standard and obfuscated representations.
    """
    clean_host = host.strip("[]")

    # 1. Standard dotted-decimal IPv4 or IPv6
    try:
        return ipaddress.ip_address(clean_host)
    except ValueError:
        pass

    # 2. Single integer / DWORD (e.g. 2130706433 for 127.0.0.1)
    if DWORD_IP_PATTERN.match(clean_host):
        try:
            return ipaddress.IPv4Address(int(clean_host))
        except ValueError:
            pass

    # 3. Hexadecimal format (e.g. 0x7f.0x0.0x0.0x1 or 0x7f000001)
    if HEX_IP_PATTERN.match(clean_host):
        try:
            parts = clean_host.split(".")
            if len(parts) == 1:
                return ipaddress.IPv4Address(int(parts[0], 16))
            elif len(parts) == 4:
                return ipaddress.IPv4Address(".".join(str(int(p, 16)) for p in parts))
        except (ValueError, OverflowError):
            pass

    # 4. Octal format (e.g. 0177.0.0.1)
    if OCTAL_IP_PATTERN.match(clean_host):
        try:
            parts = clean_host.split(".")
            if len(parts) == 4:
                return ipaddress.IPv4Address(".".join(str(int(p, 8)) for p in parts))
        except (ValueError, OverflowError):
            pass

    return None


def detect_ssrf_and_ip_host(url_or_domain: str) -> Dict[str, Any]:
    """
    Checks if a URL targets a raw IP, local network, cloud metadata service, or obfuscated IP.
    Method detected: 'SSRF & Obfuscated IP Host Protection'.
    """
    host = url_or_domain.lower()
    if "://" in host:
        parsed = urlparse(host)
        host = parsed.hostname or host
    if "/" in host:
        host = host.split("/")[0]
    if ":" in host and not host.startswith("["):
        host = host.split(":")[0]

    ip_obj = parse_ip_address(host)

    if not ip_obj:
        return {
            "is_ip_host": False,
            "is_ssrf_risk": False,
            "ip_address": None,
            "detection_method": None,
        }

    # Check against restricted ranges
    is_private_or_internal = any(ip_obj in net for net in RESTRICTED_NETWORKS)
    is_cloud_metadata = str(ip_obj) == "169.254.169.254"

    if is_cloud_metadata:
        risk_desc = "Cloud Instance Metadata Service (AWS/GCP/Azure link-local token exfiltration target)"
        method = "SSRF & Cloud Metadata Address Exfiltration Guard"
    elif is_private_or_internal:
        risk_desc = f"Internal / RFC 1918 Private Network Range ({ip_obj})"
        method = "SSRF & Private Subnet Isolation Guard"
    else:
        risk_desc = f"Direct IP hosting without domain name ({ip_obj})"
        method = "SSRF & Direct IP Host Protection"

    return {
        "is_ip_host": True,
        "is_ssrf_risk": is_private_or_internal or is_cloud_metadata,
        "ip_address": str(ip_obj),
        "is_cloud_metadata": is_cloud_metadata,
        "is_private_network": is_private_or_internal,
        "risk_description": risk_desc,
        "detection_method": method,
    }
