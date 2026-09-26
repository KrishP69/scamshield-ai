import re
from typing import Any, Dict, List, Optional
import phonenumbers


# Regular expressions for crypto wallet addresses
CRYPTO_PATTERNS = {
    "ethereum": re.compile(r"\b0x[a-fA-F0-9]{40}\b"),
    "bitcoin": re.compile(r"\b(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,65})\b"),
    "tron": re.compile(r"\bT[A-Za-z1-9]{33}\b"),
    "solana": re.compile(r"\b[1-9A-HJ-NP-Za-km-z]{32,44}\b"),
}

# URL pattern matching standard and un-schemed domain addresses
URL_PATTERN = re.compile(
    r"\b(?:https?://|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?|"
    r"\b[a-zA-Z0-9.-]+\.(?:com|org|net|xyz|top|info|live|vip|online|site|co|in|tech|app)(?:/[^\s]*)?\b",
    re.IGNORECASE,
)

# Social media handles & direct invite links
USERNAME_PATTERN = re.compile(r"(?:@([a-zA-Z0-9_]{3,32})|t\.me/([a-zA-Z0-9_+]{3,32}))")

# Currency / monetary amount patterns (INR, USD, Crypto)
AMOUNT_PATTERN = re.compile(
    r"(?:(?:₹|rs\.?|inr|usd|\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+)\s*(?:lakh|crore|k|m)?|"
    r"(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+)\s*(?:₹|rs\.?|rupees|inr|lakh|crore|eth|btc|usdt))\b",
    re.IGNORECASE,
)


def extract_urls(text: str) -> List[str]:
    """Extracts all URLs and domain references from text."""
    matches = URL_PATTERN.findall(text)
    # Deduplicate while preserving order
    seen = set()
    urls = []
    for match in matches:
        clean_url = match.strip(".,;:)'\"")
        if clean_url and clean_url not in seen:
            seen.add(clean_url)
            urls.append(clean_url)
    return urls


def extract_phone_numbers(text: str, default_region: str = "IN") -> List[Dict[str, Any]]:
    """Extracts and validates phone numbers using Google's libphonenumber."""
    results = []
    seen = set()

    for match in phonenumbers.PhoneNumberMatcher(text, default_region):
        num = match.number
        e164 = phonenumbers.format_number(num, phonenumbers.PhoneNumberFormat.E164)
        if e164 not in seen:
            seen.add(e164)
            is_valid = phonenumbers.is_valid_number(num)
            region = phonenumbers.region_code_for_number(num)
            results.append({
                "raw": match.raw_string,
                "e164": e164,
                "valid": is_valid,
                "country_code": num.country_code,
                "region": region,
                "span": (match.start, match.end),
            })

    # Fallback regex for standard 10-digit Indian numbers without country code if not matched
    if not results:
        fallback_pattern = re.compile(r"\b(?:[6-9]\d{9})\b")
        for match in fallback_pattern.finditer(text):
            raw = match.group(0)
            if raw not in seen:
                seen.add(raw)
                results.append({
                    "raw": raw,
                    "e164": f"+91{raw}",
                    "valid": True,
                    "country_code": 91,
                    "region": "IN",
                    "span": (match.start(), match.end()),
                })

    return results


def extract_crypto_wallets(text: str) -> List[Dict[str, str]]:
    """Extracts cryptocurrency addresses (ETH/EVM, Bitcoin, TRON, Solana)."""
    wallets = []
    seen = set()

    for chain, pattern in CRYPTO_PATTERNS.items():
        for match in pattern.finditer(text):
            addr = match.group(0)
            if addr not in seen:
                seen.add(addr)
                wallets.append({
                    "address": addr,
                    "chain": chain,
                    "start": match.start(),
                    "end": match.end(),
                })

    return wallets


def extract_usernames(text: str) -> List[str]:
    """Extracts platform usernames and Telegram invite handles."""
    handles = []
    seen = set()
    for match in USERNAME_PATTERN.finditer(text):
        handle = match.group(1) or match.group(2)
        if handle and handle not in seen:
            seen.add(handle)
            handles.append(handle)
    return handles


def extract_amounts(text: str) -> List[str]:
    """Extracts financial and cryptocurrency amounts."""
    amounts = []
    for match in AMOUNT_PATTERN.finditer(text):
        raw = match.group(0).strip()
        if raw and raw not in amounts:
            amounts.append(raw)
    return amounts


def extract_all_entities(text: str) -> Dict[str, Any]:
    """Runs all entity extractors on the given text."""
    return {
        "urls": extract_urls(text),
        "phones": extract_phone_numbers(text),
        "wallets": extract_crypto_wallets(text),
        "usernames": extract_usernames(text),
        "amounts": extract_amounts(text),
    }
