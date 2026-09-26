from typing import Dict, List
from app.schemas.common import SeverityLevel
from app.schemas.finding import Evidence, Finding

# Translation dictionary for fixed reason codes (Blueprint Section 8.4)
REASON_TRANSLATIONS_HINDI: Dict[str, str] = {
    "URGENCY": "यह संदेश आपको 10 मिनट के भीतर तुरंत कार्रवाई करने के लिए दबाव डालता है (जल्दबाज़ी की रणनीति)।",
    "FAKE_AUTHORITY": "संदेश भेजने वाला भारतीय सेना या पुलिस अधिकारी होने का झूठा दावा कर रहा है।",
    "ADVANCE_PAYMENT_REQUEST": "विक्रेता आपसे अग्रिम भुगतान या गेट पास सुरक्षा जमा करने के लिए कह रहा है।",
    "OFF_PLATFORM_MOVE": "संदेश आपको प्लेटफॉर्म छोड़कर टेलीग्राम या व्हाट्सएप पर चैट करने को कहता है।",
    "TOO_GOOD_TO_BE_TRUE": "यह योजना 20 मिनट में 300% रिटर्न या गारंटीड मुनाफे का अवास्तविक वादा करती है।",
    "SECRECY_ISOLATION": "संदेश आपको परिवार या अधिकारियों को न बताने और गोपनीयता रखने का निर्देश देता है।",
    "EMOTIONAL_PRESSURE": "अस्पताल में आपातकाल या पुलिस हिरासत का डर दिखाकर भावनात्मक दबाव बनाया जा रहा है।",
    "IMPERSONATION_OF_KNOWN_PERSON": "संदेश में किसी परिचित या दोस्त का रूप धरकर पैसे मांगे जा रहे हैं।",
    "CREDENTIAL_REQUEST": "आपसे गुप्त सीड फ्रेज, पासवर्ड, पिन या ओटीपी मांगा जा रहा है। कभी साझा न करें।",
    "THREAT_OR_FEAR": "संदेश में खाता बंद करने, गिरफ्तारी या संपत्ति जब्त करने की धमकी दी जा रही है।",
}

SEVERITY_ORDER = {
    SeverityLevel.CRITICAL: 0,
    SeverityLevel.HIGH: 1,
    SeverityLevel.MEDIUM: 2,
    SeverityLevel.LOW: 3,
}


def synthesize_reasons(findings: List[Finding], target_lang: str = "en") -> List[Evidence]:
    """
    Collects evidence from all findings, dedupes, sorts by severity,
    and returns top 3-6 explainable reasons with spans.
    """
    all_evidence: List[Evidence] = []
    seen_codes = set()

    for f in findings:
        for ev in f.evidence:
            if ev.code not in seen_codes:
                seen_codes.add(ev.code)
                # Translate plain text if Hindi requested and translation exists
                plain_text = ev.plain_text
                if target_lang == "hi" and ev.code in REASON_TRANSLATIONS_HINDI:
                    plain_text = REASON_TRANSLATIONS_HINDI[ev.code]

                all_evidence.append(
                    Evidence(
                        code=ev.code,
                        severity=ev.severity,
                        title=ev.title,
                        plain_text=plain_text,
                        source=ev.source,
                        span=ev.span,
                    )
                )

    # Sort primarily by severity, secondarily by presence of span
    all_evidence.sort(key=lambda e: (SEVERITY_ORDER.get(e.severity, 99), 0 if e.span else 1))

    # Return top 3-6 reasons (or all if fewer)
    return all_evidence[:6]
