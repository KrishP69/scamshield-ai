import math
import re
from typing import Any, Dict, List
from urllib.parse import urlparse

# High-risk / disposable TLDs heavily abused by phishing operators
HIGH_RISK_TLDS = {
    "xyz", "top", "click", "rest", "fit", "vip", "live", "tk", "ml", "ga",
    "cf", "gq", "buzz", "work", "sbs", "icu", "lat", "monster", "quest",
    "beauty", "cfd", "cam", "skin", "hair", "bond", "date", "racing", "stream"
}

# Phishing and financial social-engineering keywords
PHISHING_KEYWORDS = [
    "kyc", "pan", "pancard", "aadhaar", "yono", "verify", "verification",
    "update", "suspended", "blocked", "reactivate", "restore", "security",
    "login", "signin", "auth", "banking", "netbanking", "refund", "claim",
    "airdrop", "bonus", "reward", "lottery", "gift", "giveaway", "free-crypto",
    "seed-phrase", "private-key", "gatepass", "courier", "cashback", "telegram-premium"
]

# High-profile brands to check against unverified domains
KNOWN_BRANDS = [
    "sbi", "hdfc", "icici", "axis", "pnb", "bob", "paytm", "phonepe",
    "google", "apple", "microsoft", "telegram", "whatsapp", "facebook",
    "meta", "instagram", "binance", "metamask", "trustwallet", "coinbase"
]


def calculate_shannon_entropy(s: str) -> float:
    """Calculates Shannon entropy to detect algorithmically generated domains (DGA)."""
    if not s:
        return 0.0
    prob = [float(s.count(c)) / len(s) for c in dict.fromkeys(list(s))]
    return -sum(p * math.log(p, 2) for p in prob)


def analyze_heuristics(url_or_domain: str) -> Dict[str, Any]:
    """
    Performs structural, vocabulary, and entropy heuristics on the URL.
    """
    url = url_or_domain.lower()
    if not url.startswith(("http://", "https://")):
        url = "http://" + url

    parsed = urlparse(url)
    hostname = parsed.hostname or parsed.netloc or ""
    path = parsed.path or ""
    full_str = f"{hostname}{path}".lower()

    # Extract TLD
    tld = hostname.split(".")[-1] if "." in hostname else ""
    is_high_risk_tld = tld in HIGH_RISK_TLDS

    # Subdomain depth
    subdomain_parts = hostname.split(".")
    subdomain_depth = len(subdomain_parts)
    is_excessive_subdomains = subdomain_depth >= 4

    # Keyword matching
    matched_keywords: List[str] = []
    for kw in PHISHING_KEYWORDS:
        if re.search(rf"\b{re.escape(kw)}\b", full_str) or f"-{kw}" in full_str or f"{kw}-" in full_str or f"/{kw}" in full_str:
            matched_keywords.append(kw)

    # Brand matching in domain (without being official domain)
    matched_brands: List[str] = []
    for b in KNOWN_BRANDS:
        if b in hostname:
            # Check if this hostname is genuinely the brand
            if not (hostname == f"{b}.com" or hostname == f"{b}.co.in" or hostname == f"{b}.org" or hostname == f"{b}.in" or hostname.endswith(f".{b}.com")):
                matched_brands.append(b)

    # Shannon Entropy on main domain label
    domain_labels = [p for p in subdomain_parts if p and p != tld]
    main_label = domain_labels[-1] if domain_labels else hostname
    entropy = round(calculate_shannon_entropy(main_label), 2)
    # High entropy threshold for short strings (> 3.8 indicates high randomness)
    is_dga_entropy = entropy >= 3.85 and len(main_label) >= 10

    # Risk compound
    score = 0.0
    methods_triggered: List[str] = []

    if is_high_risk_tld:
        score += 0.35
        methods_triggered.append(f"High-Risk TLD (.{tld}) Analysis")

    if matched_keywords:
        score += min(len(matched_keywords) * 0.20, 0.50)
        methods_triggered.append(f"Phishing & Banking Keyword Detection: [{', '.join(matched_keywords[:4])}]")

    if matched_brands:
        score += 0.45
        methods_triggered.append(f"Target Brand Impersonation: [{', '.join(matched_brands).upper()}] on Unofficial Host")

    if is_excessive_subdomains:
        score += 0.20
        methods_triggered.append(f"Excessive Subdomain Nesting Depth ({subdomain_depth} levels)")

    if is_dga_entropy:
        score += 0.30
        methods_triggered.append(f"High-Entropy Algorithmic Domain Detection (DGA: {entropy} bits/char)")

    score = min(score, 0.98)
    is_fishy = score >= 0.40

    primary_method = methods_triggered[0] if methods_triggered else "Structural URL Heuristics"
    if matched_brands and matched_keywords:
        primary_method = f"Brand Impersonation & Phishing Keyword Harvest (Target: {', '.join(matched_brands).upper()})"
    elif is_dga_entropy:
        primary_method = f"High-Entropy Algorithmic Domain Detection (DGA Entropy: {entropy})"
    elif is_high_risk_tld and matched_keywords:
        primary_method = f"High-Risk Disposable TLD (.{tld}) with Urgent Social Engineering Terms"

    return {
        "is_fishy": is_fishy,
        "score": round(score, 2),
        "is_high_risk_tld": is_high_risk_tld,
        "tld": tld,
        "matched_keywords": matched_keywords,
        "matched_brands": matched_brands,
        "subdomain_depth": subdomain_depth,
        "entropy": entropy,
        "is_dga_entropy": is_dga_entropy,
        "methods_triggered": methods_triggered,
        "primary_method": primary_method,
    }
