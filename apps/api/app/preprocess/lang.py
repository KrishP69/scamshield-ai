import re
from typing import Dict

# Common Hinglish marker words frequently found in Indian online scams
HINGLISH_MARKERS = {
    "bhai", "karo", "kijiye", "turant", "paisa", "rupaye", "rupees", "bhejo", "bhej",
    "jaldi", "otp", "de", "do", "khata", "band", "hoga", "sarkari", "fauj", "fauji",
    "police", "thana", "giraftaar", "dhoka", "inami", "jeet", "lottery", "inaam",
    "aaj", "abhi", "kal", "madad", "chahiye", "aapka", "apna", "khabar", "namaste"
}

# Distinctive Marathi words in Devanagari / Latin
MARATHI_MARKERS = {
    "आहे", "नाही", "करा", "पाठवा", "लवकर", "पैसे", "खाते", "पोलीस", "तातडीने"
}


def detect_language(text: str) -> Dict[str, any]:
    """
    Identifies the language and script of the input text:
    - en: English
    - hi: Hindi (Devanagari)
    - mr: Marathi (Devanagari)
    - hinglish: Hindi written in Latin script
    """
    if not text:
        return {"language": "en", "script": "latin", "confidence": 1.0}

    # Check for Devanagari characters: Unicode range U+0900 to U+097F
    devanagari_count = len(re.findall(r"[\u0900-\u097F]", text))
    total_chars = len(re.findall(r"[^\s]", text)) or 1

    if devanagari_count / total_chars > 0.2:
        # Check if contains distinctive Marathi markers
        for m in MARATHI_MARKERS:
            if m in text:
                return {"language": "mr", "script": "devanagari", "confidence": 0.85}
        return {"language": "hi", "script": "devanagari", "confidence": 0.9}

    # Evaluate Hinglish markers in Latin text
    words = set(re.findall(r"\b[a-zA-Z]+\b", text.lower()))
    hinglish_matches = words.intersection(HINGLISH_MARKERS)

    if len(hinglish_matches) >= 2 or (len(words) > 0 and len(hinglish_matches) / len(words) > 0.15):
        return {
            "language": "hinglish",
            "script": "latin",
            "confidence": min(0.5 + 0.1 * len(hinglish_matches), 0.95),
            "markers": list(hinglish_matches),
        }

    return {"language": "en", "script": "latin", "confidence": 0.9}
