import ipaddress
import re
import socket
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

# Comprehensive Private & Reserved IPv4 / IPv6 networks according to RFC 1918, RFC 3927, RFC 4193, RFC 6598, etc.
RESTRICTED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),         # Broadcast / Current Network (Unix localhost equivalence)
    ipaddress.ip_network("10.0.0.0/8"),        # RFC 1918 Private
    ipaddress.ip_network("100.64.0.0/10"),     # RFC 6598 Shared Address Space / Carrier-Grade NAT (Cloud VPCs)
    ipaddress.ip_network("127.0.0.0/8"),       # Loopback
    ipaddress.ip_network("169.254.0.0/16"),    # Link-Local (AWS/GCP/Azure 169.254.169.254 metadata)
    ipaddress.ip_network("172.16.0.0/12"),     # RFC 1918 Private
    ipaddress.ip_network("192.0.0.0/24"),      # IETF Protocol Assignments
    ipaddress.ip_network("192.0.2.0/24"),      # TEST-NET-1 documentation
    ipaddress.ip_network("192.168.0.0/16"),    # RFC 1918 Private
    ipaddress.ip_network("198.18.0.0/15"),     # Benchmark testing
    ipaddress.ip_network("198.51.100.0/24"),   # TEST-NET-2 documentation
    ipaddress.ip_network("203.0.113.0/24"),    # TEST-NET-3 documentation
    ipaddress.ip_network("224.0.0.0/4"),       # Multicast
    ipaddress.ip_network("240.0.0.0/4"),       # Reserved / Future Use
    ipaddress.ip_network("255.255.255.255/32"),# Broadcast

    # IPv6 Restricted Ranges
    ipaddress.ip_network("::/128"),            # Unspecified
    ipaddress.ip_network("::1/128"),           # Loopback
    ipaddress.ip_network("::ffff:0:0/96"),     # IPv4-mapped IPv6
    ipaddress.ip_network("64:ff9b::/96"),      # IPv4/IPv6 translation
    ipaddress.ip_network("100::/64"),          # Discard-only prefix
    ipaddress.ip_network("2001:db8::/32"),     # Documentation
    ipaddress.ip_network("fc00::/7"),          # Unique local (ULA)
    ipaddress.ip_network("fe80::/10"),         # Link-local
    ipaddress.ip_network("ff00::/8"),          # Multicast
]

FORBIDDEN_DOMAIN_PATTERNS = [
    re.compile(r"^(?:.*\.)?localhost$", re.IGNORECASE),
    re.compile(r"^(?:.*\.)?local$", re.IGNORECASE),
    re.compile(r"^(?:.*\.)?internal$", re.IGNORECASE),
    re.compile(r"^(?:.*\.)?lan$", re.IGNORECASE),
    re.compile(r"^(?:.*\.)?home\.arpa$", re.IGNORECASE),
    re.compile(r"^(?:.*\.)?corp$", re.IGNORECASE),
    re.compile(r"^(?:metadata\.google\.internal|instance-data|169\.254\.169\.254)$", re.IGNORECASE),
]

# Patterns for non-standard IP formats (hex, octal, single-integer dword)
HEX_IP_PATTERN = re.compile(r"^0x[0-9a-fA-F]+(?:\.0x[0-9a-fA-F]+)*$")
OCTAL_IP_PATTERN = re.compile(r"^0[0-7]+(?:\.0[0-7]+)*$")
DWORD_IP_PATTERN = re.compile(r"^\d{8,11}$")


def normalize_ip(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> ipaddress.IPv4Address | ipaddress.IPv6Address:
    """Unpacks IPv4-mapped IPv6 addresses so ::ffff:127.0.0.1 evaluates against IPv4 subnets."""
    if isinstance(ip_obj, ipaddress.IPv6Address) and ip_obj.ipv4_mapped:
        return ip_obj.ipv4_mapped
    return ip_obj


def is_ip_restricted(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Checks whether an IP address belongs to any restricted, internal, or metadata subnets."""
    norm = normalize_ip(ip_obj)
    for net in RESTRICTED_NETWORKS:
        try:
            if norm in net:
                return True
        except TypeError:
            continue
    return False


def parse_ip_address(host: str) -> Optional[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    """
    Tries to resolve host into an IP address, handling standard and obfuscated representations.
    """
    clean_host = host.strip("[]").strip()
    if not clean_host:
        return None

    # 1. Standard dotted-decimal IPv4 or IPv6
    try:
        return ipaddress.ip_address(clean_host)
    except ValueError:
        pass

    # 2. Standard or BSD shorthand IPv4 formats (e.g. 127.1, 10.1, 0, 192.168.1)
    if not any(c in clean_host.lower() for c in "ghijklmnopqrstuvwxyz"):
        try:
            return ipaddress.IPv4Address(socket.inet_aton(clean_host))
        except (OSError, ValueError):
            pass

    # 3. Single integer / DWORD (e.g. 2130706433 for 127.0.0.1)
    if DWORD_IP_PATTERN.match(clean_host):
        try:
            return ipaddress.IPv4Address(int(clean_host))
        except ValueError:
            pass

    # 4. Hexadecimal format (e.g. 0x7f.0x0.0x0.0x1 or 0x7f000001)
    if HEX_IP_PATTERN.match(clean_host):
        try:
            parts = clean_host.split(".")
            if len(parts) == 1:
                return ipaddress.IPv4Address(int(parts[0], 16))
            elif len(parts) == 4:
                return ipaddress.IPv4Address(".".join(str(int(p, 16)) for p in parts))
        except (ValueError, OverflowError):
            pass

    # 5. Octal format (e.g. 0177.0.0.1)
    if OCTAL_IP_PATTERN.match(clean_host):
        try:
            parts = clean_host.split(".")
            if len(parts) == 4:
                return ipaddress.IPv4Address(".".join(str(int(p, 8)) for p in parts))
        except (ValueError, OverflowError):
            pass

    return None


def resolve_hostname_ips(host: str) -> List[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    """Resolves DNS hostname to list of IP addresses to prevent DNS rebinding SSRF."""
    resolved: List[ipaddress.IPv4Address | ipaddress.IPv6Address] = []
    clean_host = host.strip("[]")
    try:
        addr_info = socket.getaddrinfo(clean_host, None)
        for item in addr_info:
            sockaddr = item[4]
            ip_str = sockaddr[0]
            try:
                ip_obj = ipaddress.ip_address(ip_str)
                if ip_obj not in resolved:
                    resolved.append(ip_obj)
            except ValueError:
                continue
    except (socket.gaierror, socket.herror, OSError):
        pass
    return resolved


def detect_ssrf_and_ip_host(url_or_domain: str) -> Dict[str, Any]:
    """
    Checks if a URL targets a raw IP, local network, cloud metadata service, obfuscated IP,
    or a domain resolving to internal / restricted network addresses (preventing DNS rebinding).
    """
    host = url_or_domain.lower().strip()
    if "://" in host:
        parsed = urlparse(host)
        host = parsed.hostname or host
    else:
        parsed = urlparse("//" + host)
        host = parsed.hostname or host

    if "/" in host:
        host = host.split("/")[0]

    host = host.strip("[]").strip()

    # 1. Check prohibited hostname patterns
    for pat in FORBIDDEN_DOMAIN_PATTERNS:
        if pat.match(host):
            return {
                "is_ip_host": False,
                "is_ssrf_risk": True,
                "ip_address": host,
                "is_cloud_metadata": "169.254" in host or "metadata" in host or "instance" in host,
                "is_private_network": True,
                "risk_description": f"Internal / Reserved Hostname Forbidden ({host})",
                "detection_method": "SSRF & Internal Hostname Isolation Guard",
            }

    # 2. Check literal or obfuscated IP
    ip_obj = parse_ip_address(host)

    if ip_obj:
        is_restricted = is_ip_restricted(ip_obj)
        is_cloud_metadata = str(normalize_ip(ip_obj)) == "169.254.169.254"

        if is_cloud_metadata:
            risk_desc = "Cloud Instance Metadata Service (AWS/GCP/Azure link-local token exfiltration target)"
            method = "SSRF & Cloud Metadata Address Exfiltration Guard"
        elif is_restricted:
            risk_desc = f"Internal / Restricted Network Range ({ip_obj})"
            method = "SSRF & Private Subnet Isolation Guard"
        else:
            risk_desc = f"Direct IP hosting without domain name ({ip_obj})"
            method = "SSRF & Direct IP Host Protection"

        return {
            "is_ip_host": True,
            "is_ssrf_risk": is_restricted or is_cloud_metadata,
            "ip_address": str(ip_obj),
            "is_cloud_metadata": is_cloud_metadata,
            "is_private_network": is_restricted,
            "risk_description": risk_desc,
            "detection_method": method,
        }

    # 3. DNS Hostname Resolution Guard (catches 127.0.0.1.nip.io, localtest.me, DNS rebinding)
    resolved_ips = resolve_hostname_ips(host)
    for res_ip in resolved_ips:
        if is_ip_restricted(res_ip):
            is_cloud = str(normalize_ip(res_ip)) == "169.254.169.254"
            return {
                "is_ip_host": False,
                "is_ssrf_risk": True,
                "ip_address": str(res_ip),
                "is_cloud_metadata": is_cloud,
                "is_private_network": True,
                "risk_description": f"Domain resolves to internal / restricted IP ({host} -> {res_ip})",
                "detection_method": "SSRF & DNS Rebinding Subnet Guard",
            }

    return {
        "is_ip_host": False,
        "is_ssrf_risk": False,
        "ip_address": None,
        "detection_method": None,
    }
