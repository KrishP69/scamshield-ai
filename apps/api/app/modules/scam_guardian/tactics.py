import re
from typing import Dict, List, Tuple
from app.schemas.common import ScanSource, SeverityLevel
from app.schemas.finding import Evidence

# Lexicon and Regex rules for the 10 manipulation tactics (Blueprint Section 7.1)
TACTIC_RULES: Dict[str, Dict[str, any]] = {
    "urgency": {
        "title": "Artificial Urgency & Time Pressure",
        "severity": SeverityLevel.HIGH,
        "plain_text": "The message pressures you to act immediately (e.g. within minutes) to prevent rational verification.",
        "patterns": [
            r"\b(?:within\s*\d+\s*(?:mins?|minutes?|hours?|hrs?))\b",
            r"\b(?:immediately|urgently|right now|hurry|asap|fast|act now|limited time|last chance)\b",
            r"\b(?:deactivated today|account blocked today|expire in \d+)\b",
            r"\b(?:turant|jaldi|abhi)\b",
        ],
    },
    "fake_authority": {
        "title": "Impersonation of Authority or Official Organization",
        "severity": SeverityLevel.HIGH,
        "plain_text": "Claims to represent the Indian Army, Police, Cyber Cell, Bank, or Government official to demand trust.",
        "patterns": [
            r"\b(?:indian army|cantonment|defence personnel|military truck|army officer|colonel|subedar)\b",
            r"\b(?:police officer|delhi police|mumbai police|cbi|ed|customs department|cyber crime cell)\b",
            r"\b(?:sbi yono|hdfc bank|icici bank|rbi official|income tax department)\b",
            r"\b(?:fauj|fauji|police thana)\b",
        ],
    },
    "advance_payment_request": {
        "title": "Advance Payment / Deposit Demand",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Asks you to pay an advance, gate pass, or courier security deposit before delivering goods or money.",
        "patterns": [
            r"\b(?:transfer (?:rs\.?|inr|₹)?\s*\d+.*?(?:advance|deposit|security|gate pass))\b",
            r"\b(?:pay (?:rs\.?|inr|₹)?\s*\d+.*?(?:advance|deposit|charges|fee))\b",
            r"\b(?:gate pass|courier deposit|registration fee|refundable fee)\b",
            r"\b(?:advance payment|advance bhejo)\b",
        ],
    },
    "off_platform_move": {
        "title": "Attempt to Move Off-Platform",
        "severity": SeverityLevel.MEDIUM,
        "plain_text": "Encourages you to leave the safety of Facebook or the verified app to chat on WhatsApp or Telegram.",
        "patterns": [
            r"\b(?:message me on whatsapp|dm me on telegram|chat on telegram|text on whatsapp)\b",
            r"\b(?:whatsapp (?:pe|me)|telegram (?:pe|me))\b",
            r"\b(?:t\.me/|wa\.me/)\b",
        ],
    },
    "too_good_to_be_true": {
        "title": "Unrealistic Financial Returns or Free Giveaways",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Promises guaranteed 2x/3x returns, free lottery winnings, or lucrative daily earnings for easy tasks.",
        "patterns": [
            r"\b(?:guaranteed \d+x|instant \d+x|receive \d+x back|double your money)\b",
            r"\b(?:guaranteed \d+%\s*returns?|300% instant returns?)\b",
            r"\b(?:won (?:rs\.?|₹|\$)\s*\d+.*?(?:lottery|prize|reward))\b",
            r"\b(?:like and earn|youtube subscribe task|daily 5000 income)\b",
        ],
    },
    "secrecy_isolation": {
        "title": "Secrecy & Isolation Tactic",
        "severity": SeverityLevel.HIGH,
        "plain_text": "Instructs you not to contact family, call officials, or speak openly, isolating you from second opinions.",
        "patterns": [
            r"\b(?:don't tell (?:dad|mom|anyone|family)|keep it confidential|do not discuss)\b",
            r"\b(?:please don't call|cannot speak on call|inside the ward|no calls)\b",
            r"\b(?:kisi ko mat batana|secret rakhna)\b",
        ],
    },
    "emotional_pressure": {
        "title": "Severe Emotional Manipulation or Distress",
        "severity": SeverityLevel.HIGH,
        "plain_text": "Fabricates hospital emergencies, accidents, ICU admissions, or arrest panics to force urgent compliance.",
        "patterns": [
            r"\b(?:icu|admitted to hospital|accident|emergency surgery|life or death)\b",
            r"\b(?:stranded|cards are blocked|wallet stolen|lost phone in a taxi)\b",
            r"\b(?:detained by police|arrested|fir will be registered|jail)\b",
        ],
    },
    "impersonation_of_known_person": {
        "title": "Impersonation of Friend or Relative",
        "severity": SeverityLevel.HIGH,
        "plain_text": "Claims to be a known contact using a new or temporary number because their phone was lost or damaged.",
        "patterns": [
            r"\b(?:this is my new (?:temporary )?number|lost my old phone|new whatsapp number)\b",
            r"\b(?:hi dear,? lost my old phone|pehechana mujhe|mera naya number)\b",
        ],
    },
    "credential_request": {
        "title": "Unauthorized Credential or Security Key Request",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Requests your seed phrase, private key, OTP, PIN, or CVV. Legitimate services NEVER ask for these.",
        "patterns": [
            r"\b(?:seed phrase|private key|recovery phrase|12-word|secret key)\b",
            r"\b(?:enter your otp|share otp|tell me otp|upi pin|atm pin|cvv)\b",
            r"\b(?:otp bhejo|pin enter karo)\b",
        ],
    },
    "threat_or_fear": {
        "title": "Threats, Extortion, or Digital Arrest Fear",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Threatens legal action, arrest, account termination, or asset seizure to intimidate you into compliance.",
        "patterns": [
            r"\b(?:permanently deactivated|funds will be seized|police warrant|digital arrest)\b",
            r"\b(?:legal action|lock me up|court summons|fir will be registered)\b",
            r"\b(?:jail bhej denge|account band ho jayega)\b",
        ],
    },
}


def detect_tactics(text: str) -> List[Evidence]:
    """
    Scans text against manipulation tactic regex rules, extracts matching word spans,
    and returns Evidence objects.
    """
    evidences: List[Evidence] = []
    text_lower = text.lower()

    for tactic_code, meta in TACTIC_RULES.items():
        matched_spans: List[Tuple[int, int]] = []
        for pat in meta["patterns"]:
            pattern = re.compile(pat, re.IGNORECASE)
            for m in pattern.finditer(text):
                matched_spans.append((m.start(), m.end()))

        if matched_spans:
            # Pick first prominent span for UI highlighting
            primary_span = matched_spans[0]
            evidences.append(
                Evidence(
                    code=tactic_code.upper(),
                    severity=meta["severity"],
                    title=meta["title"],
                    plain_text=meta["plain_text"],
                    source=ScanSource.RULE,
                    span=primary_span,
                )
            )

    return evidences
