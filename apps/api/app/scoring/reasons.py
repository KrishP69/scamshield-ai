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
    "PHISHING_URL_HOMOGLYPH": "लिंक में असली वेबसाइट जैसे दिखने वाले नकली अक्षरों (हॉमोग्लिफ़ / प्यूनीकोड) का उपयोग किया गया है।",
    "PHISHING_URL_EXTERNAL_INTEL": "यह लिंक वास्तविक समय थ्रेट डेटाबेस में एक पुष्टि की गई फ़िशिंग / मैलवेयर वेबसाइट है।",
    "PHISHING_URL_SSRF": "यह लिंक आंतरिक या निजी आईपी नेटवर्क पते को निशाना बना रहा है (SSRF जोखिम)।",
    "PHISHING_URL_HEURISTICS": "इस लिंक का डोमेन (.xyz / .top) और कीवर्ड्स बैंक या सरकारी पोर्टल की नकल करते हैं।",
    "PHISHING_URL_UNSHORTENED": "छोटे किए गए लिंक (Short URL) के पीछे छिपी हुई संदेहास्पद वेबसाइट का पता चला है।",
    "TASK_JOB_SCAM": "यह यूट्यूब वीडियो लाइक करने या होटल रेटिंग के बदले रोज़ाना ₹3000-8000 कमाने का फर्जी टेलीग्राम टास्क स्कैम है।",
    "UTILITY_ELECTRICITY_SCAM": "बिजली कनेक्शन आज रात 9:30 बजे काटने की झूठी धमकी देकर ठगने का प्रयास किया जा रहा है।",
    "DIGITAL_ARREST_CUSTOMS": "कूरियर पार्सल में ड्रग्स पकड़े जाने का झूठा नाटक करके और सीबीआई/पुलिस का डर दिखाकर डिजिटल अरेस्ट की कोशिश की जा रही है।",
    "LOTTERY_REWARD_SCAM": "केबीसी या लॉटरी जीतने का झूठा लालच देकर प्रोसेसिंग फीस के नाम पर अग्रिम राशि मांगी जा रही है।",
    "LOAN_APP_EXTORTION": "बिना सिबिल स्कोर लोन का झांसा देकर तस्वीरों को मॉर्फ करने और ब्लैकमेल करने की रणनीति है।",
    "TELEGRAM_GIFT_BOT_SCAM": "फ्री टेलीग्राम प्रीमियम या एयरड्रॉप बॉट के नाम पर आपका खाता या क्रिप्टो चुराने का प्रयास है।",
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
