import re
import unicodedata
from typing import Dict, List, Tuple

# Common Indian / international SMS and messaging abbreviations
ABBREVIATIONS: Dict[str, str] = {
    "plz": "please",
    "pls": "please",
    "dm": "direct message",
    "msg": "message",
    "sec": "seconds",
    "mins": "minutes",
    "min": "minutes",
    "hrs": "hours",
    "hr": "hours",
    "acc": "account",
    "a/c": "account",
    "acct": "account",
    "txn": "transaction",
    "pymt": "payment",
    "pmt": "payment",
    "dep": "deposit",
    "adv": "advance",
    "urgnt": "urgent",
    "urg": "urgent",
    "govt": "government",
    "ofc": "officer",
    "col": "colonel",
    "gen": "general",
    "amt": "amount",
    "bal": "balance",
    "otp": "one time password",
    "pin": "personal identification number",
    "kyc": "know your customer",
    "upi": "unified payments interface",
}

# Common leetspeak and obfuscated character maps
LEET_MAP: Dict[str, str] = {
    "@": "a",
    "4": "a",
    "8": "b",
    "3": "e",
    "1": "i",
    "!": "i",
    "0": "o",
    "5": "s",
    "$": "s",
    "7": "t",
    "+": "t",
}


def normalize_unicode(text: str) -> str:
    """Normalizes Unicode text (decomposing and standardizing diacritics & fullwidth characters)."""
    return unicodedata.normalize("NFKD", text)


def detect_obfuscation(text: str) -> Tuple[str, List[str]]:
    """
    Detects obfuscation techniques like separated characters (e.g. 'w.h.a.t.s.a.p.p', 'T e l e g r a m')
    and returns a cleaned version along with detected obfuscation flags.
    """
    flags: List[str] = []

    # Check for spaced out letters: e.g. "G i v e a w a y"
    spaced_word_pattern = re.compile(r"\b(?:[a-zA-Z]\s){3,}[a-zA-Z]\b")
    for match in spaced_word_pattern.finditer(text):
        flags.append(f"spaced_letters:{match.group(0)}")

    # Check for punctuated separated letters: e.g. "w.h.a.t.s.a.p.p" or "t-e-l-e-g-r-a-m"
    dot_word_pattern = re.compile(r"\b(?:[a-zA-Z][\.\-_/]){3,}[a-zA-Z]\b")
    for match in dot_word_pattern.finditer(text):
        flags.append(f"punctuated_obfuscation:{match.group(0)}")

    cleaned = text
    # Normalize dot separated words to standard words
    def deobfuscate_dots(m):
        return re.sub(r"[\.\-_/]", "", m.group(0))

    cleaned = dot_word_pattern.sub(deobfuscate_dots, cleaned)

    # Normalize spaced words
    def deobfuscate_spaces(m):
        return re.sub(r"\s+", "", m.group(0))

    cleaned = spaced_word_pattern.sub(deobfuscate_spaces, cleaned)

    return cleaned, flags


def clean_text(raw_text: str) -> Tuple[str, List[str]]:
    """
    Primary text preprocessor:
    1. Normalizes unicode (NFKD)
    2. Detects and normalizes obfuscation tricks (preserving flags)
    3. Normalizes repetitive punctuation (e.g. '????' -> '?')
    4. Expands common messaging abbreviations
    """
    if not raw_text:
        return "", []

    text = normalize_unicode(raw_text)
    text, obfuscation_flags = detect_obfuscation(text)

    # Collapse excessive punctuation while keeping meaning
    text = re.sub(r"([!?.,])\1{2,}", r"\1", text)

    # Collapse multiple whitespaces
    text = re.sub(r"[ \t]+", " ", text).strip()

    return text, obfuscation_flags
