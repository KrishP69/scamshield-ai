import hashlib
import zipfile
from typing import Any, Dict, List, Set, Tuple

# Dangerous Android permissions frequently exploited by malware (Blueprint Section 7.5)
DANGEROUS_PERMISSIONS = {
    "android.permission.BIND_ACCESSIBILITY_SERVICE": "Can read screen content, intercept keystrokes, and click buttons automatically.",
    "android.permission.READ_SMS": "Allows silent interception of one-time bank authentication passwords (OTPs).",
    "android.permission.RECEIVE_SMS": "Allows background reception and interception of transactional bank SMS alerts.",
    "android.permission.SYSTEM_ALERT_WINDOW": "Allows displaying deceptive invisible overlays on top of authentic banking apps.",
    "android.permission.REQUEST_INSTALL_PACKAGES": "Enables dropper functionality to silently download and install secondary payloads.",
    "android.permission.RECORD_AUDIO": "Can record ambient room audio without active user awareness.",
    "android.permission.READ_CALL_LOG": "Can read incoming bank verification phone calls.",
}

# Known sensitive banking / payment package prefixes targeted by impersonators
IMPERSONATION_TARGETS = [
    "com.sbi.yono", "com.sbi.rewards", "com.hdfc.bank", "com.icici.imobile",
    "com.paytm", "com.phonepe", "com.google.android.apps.nbu.paisa",
]


def inspect_permissions(permissions: List[str]) -> Tuple[List[str], bool, str]:
    """
    Evaluates Android permissions and flags dangerous combinations:
    - ACCESSIBILITY + SMS (Banking Trojan Signature)
    - SMS + INTERNET (OTP Exfiltration Signature)
    - OVERLAY + SMS (Deceptive Phishing Overlay Signature)
    """
    flags: List[str] = []
    perm_set: Set[str] = set(permissions)

    has_accessibility = "android.permission.BIND_ACCESSIBILITY_SERVICE" in perm_set
    has_sms = "android.permission.READ_SMS" in perm_set or "android.permission.RECEIVE_SMS" in perm_set
    has_internet = "android.permission.INTERNET" in perm_set
    has_overlay = "android.permission.SYSTEM_ALERT_WINDOW" in perm_set

    # Critical Combo 1: Accessibility + SMS
    if has_accessibility and has_sms:
        flags.append("DANGEROUS_COMBO: Screen Accessibility + SMS interception (Standard Banking Trojan)")

    # Critical Combo 2: SMS + Internet
    if has_sms and has_internet:
        flags.append("DANGEROUS_COMBO: SMS Interception + Internet Exfiltration permissions")

    # High Combo 3: System Alert Overlay + SMS
    if has_overlay and has_sms:
        flags.append("DANGEROUS_COMBO: System Alert Window overlay + SMS interception")

    is_critical = has_accessibility or (has_sms and has_internet)
    summary = "; ".join(flags) if flags else "Standard application permissions"
    return flags, is_critical, summary


def inspect_package_name(package_name: str) -> Tuple[bool, str]:
    """Detects whether package name impersonates known banking applications."""
    pkg_lower = package_name.lower()
    for target in IMPERSONATION_TARGETS:
        if target in pkg_lower:
            return True, f"Package name impersonates official banking application '{target}'"
    return False, ""
