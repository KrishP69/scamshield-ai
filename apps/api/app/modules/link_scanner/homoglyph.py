import idna
import re
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

# Unicode homoglyphs commonly used in IDN spoofing attacks
HOMOGLYPH_MAP: Dict[str, str] = {
    # Cyrillic
    "\u0430": "a",  # Cyrillic small letter a
    "\u0441": "c",  # Cyrillic small letter es
    "\u0435": "e",  # Cyrillic small letter ie
    "\u0456": "i",  # Cyrillic small letter byelorussian-ukrainian i
    "\u0458": "j",  # Cyrillic small letter je
    "\u043e": "o",  # Cyrillic small letter o
    "\u0440": "p",  # Cyrillic small letter er
    "\u0455": "s",  # Cyrillic small letter dze
    "\u0445": "x",  # Cyrillic small letter ha
    "\u0443": "y",  # Cyrillic small letter u
    "\u0410": "A",
    "\u0412": "B",
    "\u0421": "C",
    "\u0415": "E",
    "\u041d": "H",
    "\u0406": "I",
    "\u0408": "J",
    "\u041a": "K",
    "\u041c": "M",
    "\u041e": "O",
    "\u0420": "P",
    "\u0422": "T",
    "\u0425": "X",
    # Greek
    "\u03b1": "a",  # alpha
    "\u03bf": "o",  # omicron
    "\u03bd": "v",  # nu
    "\u03c1": "p",  # rho
    "\u03c4": "t",  # tau
    # Other confusable symbols
    "\u2010": "-",  # hyphen
    "\u2013": "-",  # en dash
    "\u2014": "-",  # em dash
}

# High-value brands frequently impersonated in phishing attacks
TARGET_BRANDS: Dict[str, List[str]] = {
    "sbi": ["sbi.co.in", "onlinesbi.sbi", "sbi.bank"],
    "hdfc": ["hdfcbank.com", "hdfc.com"],
    "icici": ["icicibank.com"],
    "axis": ["axisbank.com"],
    "paytm": ["paytm.com"],
    "phonepe": ["phonepe.com"],
    "google": ["google.com", "accounts.google.com"],
    "telegram": ["telegram.org", "t.me"],
    "whatsapp": ["whatsapp.com"],
    "facebook": ["facebook.com", "fb.com", "meta.com"],
    "instagram": ["instagram.com"],
    "binance": ["binance.com"],
    "paypal": ["paypal.com"],
    "netflix": ["netflix.com"],
    "amazon": ["amazon.in", "amazon.com"],
    "apple": ["apple.com", "icloud.com"],
    "microsoft": ["microsoft.com", "live.com"],
}


def normalize_homoglyphs(text: str) -> Tuple[str, bool, List[str]]:
    """
    Replaces unicode homoglyphs with standard ASCII equivalents.
    Returns (normalized_string, has_homoglyphs, substituted_chars).
    """
    normalized_chars = []
    has_homoglyphs = False
    substituted = []

    for char in text:
        if char in HOMOGLYPH_MAP:
            normalized_chars.append(HOMOGLYPH_MAP[char])
            has_homoglyphs = True
            substituted.append(f"U+{ord(char):04X} ('{char}' -> '{HOMOGLYPH_MAP[char]}')")
        else:
            normalized_chars.append(char)

    return "".join(normalized_chars), has_homoglyphs, substituted


def detect_punycode_and_homoglyphs(url_or_domain: str) -> Dict[str, Any]:
    """
    Analyzes a URL or domain for IDN / Punycode homoglyph spoofing.
    Method detected: 'Homoglyph / Punycode Look-alike Impersonation'.
    """
    # Parse domain
    domain = url_or_domain.lower()
    if "://" in domain:
        parsed = urlparse(domain)
        domain = parsed.netloc or parsed.path
    if "/" in domain:
        domain = domain.split("/")[0]
    if ":" in domain:
        domain = domain.split(":")[0]

    domain = domain.strip()

    is_punycode = False
    decoded_unicode = domain

    # Check Punycode (starts with xn--)
    if "xn--" in domain:
        is_punycode = True
        try:
            decoded_unicode = idna.decode(domain)
        except Exception:
            decoded_unicode = domain

    # Check for homoglyphs in Unicode representation
    normalized_ascii, has_homoglyphs, substituted_chars = normalize_homoglyphs(decoded_unicode)

    # Check if normalized domain or original domain mimics any protected target brand
    spoofed_brand = None
    canonical_target = None

    for brand, official_domains in TARGET_BRANDS.items():
        # Check brand name directly in normalized domain vs genuine domain
        for official in official_domains:
            if official in domain:
                # Genuine domain, not spoofed
                continue

            # If brand is in normalized domain, or decoded unicode closely matches official
            if brand in normalized_ascii:
                # Verify if it is NOT the official domain
                if domain != official and not domain.endswith(f".{official}"):
                    spoofed_brand = brand
                    canonical_target = official
                    break

        if spoofed_brand:
            break

    is_fishy = bool(has_homoglyphs or is_punycode or (spoofed_brand and has_homoglyphs))

    result = {
        "is_fishy": is_fishy,
        "is_punycode": is_punycode,
        "has_homoglyphs": has_homoglyphs,
        "original_domain": domain,
        "decoded_unicode": decoded_unicode if is_punycode else None,
        "normalized_ascii": normalized_ascii,
        "substituted_chars": substituted_chars,
        "spoofed_brand": spoofed_brand,
        "canonical_target": canonical_target,
        "detection_method": (
            f"Homoglyph / Punycode Look-alike Impersonation (Spoofing: {spoofed_brand.upper()} -> Genuine: {canonical_target})"
            if spoofed_brand
            else (
                "Homoglyph / Punycode Unicode Confusable Look-alike Spoofing"
                if (has_homoglyphs or is_punycode)
                else None
            )
        ),
    }

    return result
