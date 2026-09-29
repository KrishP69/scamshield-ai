import re
from typing import Any, Dict, List, Optional
from app.modules.base import ScanContext
from app.schemas.finding import Finding
from app.schemas.passport import ThreatFactor


def synthesize_threat_factors(
    findings: List[Finding],
    context: Optional[ScanContext] = None,
) -> List[ThreatFactor]:
    """
    Synthesizes the comprehensive 5-factor threat breakdown explaining
    specifically WHY an input is fishy, with actionable explanations and extracted clues.
    """
    raw_text = (context.raw_text if context else "") or ""
    text_lower = raw_text.lower()

    # Aggregate all evidence codes & plain texts across all modules
    evidence_codes = set()
    evidence_texts = []
    evidence_spans = []

    for f in findings:
        for ev in f.evidence:
            evidence_codes.add(ev.code.upper())
            evidence_texts.append(ev.plain_text)
            if ev.span:
                evidence_spans.append(ev.span)

    # Factor 1: Psychological Coercion & Time Urgency
    coercion_triggers = {"URGENCY", "SECRECY_ISOLATION", "EMOTIONAL_PRESSURE", "THREAT_OR_FEAR", "UTILITY_ELECTRICITY_SCAM", "LOAN_APP_EXTORTION"}
    is_coercion = bool(evidence_codes.intersection(coercion_triggers))
    coercion_clue = None
    m_coercion = re.search(r"\b(?:within\s*[\d,]+\s*(?:mins?|minutes?|hours?|hrs?|days?)|urgently|immediately|deactivated today|suspended today|disconnect.*?9[\.:]30|arrest warrant|non[\s-]?bailable|jail|terminated in \d+|closed in \d+)\b", text_lower)
    if m_coercion:
        coercion_clue = m_coercion.group(0)

    f1 = ThreatFactor(
        category="Coercion",
        title="Psychological Coercion & Artificial Urgency",
        is_triggered=is_coercion or bool(coercion_clue),
        severity="critical" if ("THREAT_OR_FEAR" in evidence_codes or "UTILITY_ELECTRICITY_SCAM" in evidence_codes or "LOAN_APP_EXTORTION" in evidence_codes) else ("high" if (is_coercion or coercion_clue) else "safe"),
        explanation=(
            "The message imposes intense time pressure (e.g. 'within minutes', 'power cut tonight', 'account terminated in 24 hours') or fear of immediate arrest or defamation. "
            "Scammers deliberately trigger psychological panic to disable rational skepticism and prevent you from consulting family or verifying with official sources."
            if (is_coercion or coercion_clue)
            else "No manipulative urgency or psychological panic tactics were detected."
        ),
        evidence_snippet=coercion_clue or ("Artificial urgency detected in language" if is_coercion else None),
    )

    # Factor 2: Authority & Identity Impersonation
    auth_triggers = {"FAKE_AUTHORITY", "IMPERSONATION_OF_KNOWN_PERSON", "DIGITAL_ARREST_CUSTOMS", "UTILITY_ELECTRICITY_SCAM", "TECH_SUPPORT_IMPERSONATION"}
    is_auth = bool(evidence_codes.intersection(auth_triggers))
    auth_clue = None
    auth_match = re.search(r"\b(?:indian army|cantonment|fauji|police|cbi|customs|narcotics|ncb|sbi yono|hdfc bank|icici bank|electricity officer|kbc|manager rana|telegram (?:support|security|team|bot|notification)|amazon (?:hr|manager)|flipkart)\b", text_lower)
    if auth_match:
        auth_clue = auth_match.group(0)

    f2 = ThreatFactor(
        category="Identity",
        title="Authority & Identity Impersonation",
        is_triggered=is_auth or bool(auth_clue),
        severity="critical" if ("DIGITAL_ARREST_CUSTOMS" in evidence_codes or "FAKE_AUTHORITY" in evidence_codes) else ("high" if (is_auth or auth_clue) else "safe"),
        explanation=(
            "The sender falsely claims to represent an authority figure (e.g. Indian Army, Police, CBI, Customs, Electricity Department, Bank Manager, or Telegram Security Team). "
            "Fraudsters exploit official authority and trust symbols to intimidate victims into compliance."
            if (is_auth or auth_clue)
            else "No unauthorized organizational or authority impersonation detected."
        ),
        evidence_snippet=auth_clue or ("Official organization claimed" if is_auth else None),
    )

    # Factor 3: Financial Extraction & Advance Fee Trap
    fin_triggers = {"ADVANCE_PAYMENT_REQUEST", "TOO_GOOD_TO_BE_TRUE", "TASK_JOB_SCAM", "LOTTERY_REWARD_SCAM"}
    is_fin = bool(evidence_codes.intersection(fin_triggers))
    fin_clue = None
    fin_match = re.search(r"\b(?:transfer (?:rs\.?|₹|\$)?\s*[\d,]+|gate pass|deposit|security deposit|clearance fee|processing fee|won [\d,]+|[\d,]+%\s*profit|guaranteed [\d,]+%|send [\d,]+\s*(?:usdt|eth|btc|rs)|invest [\d,]+|daily\s*salary|part[\s-]?time\s*job|vip\s*signals?|pump\s*group|crypto\s*signals?|rating\s*apps|like\s*youtube)\b", text_lower)
    if fin_match:
        fin_clue = fin_match.group(0)

    f3 = ThreatFactor(
        category="Financial",
        title="Advance Fee Demand & Unrealistic Return Trap",
        is_triggered=is_fin or bool(fin_clue),
        severity="critical" if (is_fin or fin_clue) else "safe",
        explanation=(
            "Demands an advance payment (gate pass fee, courier deposit, processing charge) or lures with impossible financial returns (200%-500% profit, YouTube like task earnings, crypto doubling, KBC lottery). "
            "In legitimate transactions, buyers pay the seller—never the reverse."
            if (is_fin or fin_clue)
            else "No upfront fee traps or unrealistic financial lures detected."
        ),
        evidence_snippet=fin_clue or ("Advance fee / guaranteed return pattern" if is_fin else None),
    )

    # Factor 4: Credential & Security Key Harvesting
    cred_triggers = {"CREDENTIAL_REQUEST", "SEED_PHRASE", "PRIVATE_KEY"}
    is_cred = bool(evidence_codes.intersection(cred_triggers))
    cred_clue = None
    cred_match = re.search(r"\b(?:seed\s*phrase|private\s*key|12[\s-]?words?|recovery\s*phrase|otp|upi\s*pin|atm\s*pin|cvv|password|login\s*code|verification\s*code|sms\s*code|qr\s*code)\b", text_lower)
    if cred_match:
        cred_clue = cred_match.group(0)

    f4 = ThreatFactor(
        category="Credential",
        title="Sensitive Credential & Secret Key Harvesting",
        is_triggered=is_cred or bool(cred_clue),
        severity="critical" if (is_cred or cred_clue) else "safe",
        explanation=(
            "Requests highly sensitive security secrets (seed phrase, private key, OTP, login verification code, or UPI PIN). "
            "Sharing these keys grants attackers immediate, irreversible access to drain your bank account or take over your account."
            if (is_cred or cred_clue)
            else "No requests for passwords, OTPs, or private keys detected."
        ),
        evidence_snippet=cred_clue or ("Demands confidential security keys" if is_cred else None),
    )

    # Factor 5: Malicious Link & Redirection Vector
    link_triggers = {"PHISHING_URL_HOMOGLYPH", "PHISHING_URL_EXTERNAL_INTEL", "PHISHING_URL_SSRF", "PHISHING_URL_HEURISTICS", "PHISHING_URL_UNSHORTENED", "OFF_PLATFORM_MOVE", "TELEGRAM_GIFT_BOT_SCAM"}
    is_link = bool(evidence_codes.intersection(link_triggers))
    link_clue = None
    # Check URLs in entities
    urls = context.entities.get("urls", []) if (context and context.entities) else []
    usernames = context.entities.get("usernames", []) if (context and context.entities) else []
    if urls:
        link_clue = urls[0]
    elif usernames:
        link_clue = f"@{usernames[0]}"
    else:
        m_link = re.search(r"(?:https?://[^\s]+|t\.me/[^\s]+|wa\.me/[^\s]+|@([a-zA-Z0-9_]{4,}))", text_lower)
        if m_link:
            link_clue = m_link.group(0)

    f5 = ThreatFactor(
        category="Destination",
        title="Deceptive Web Destination & Off-Platform Trap",
        is_triggered=is_link or bool(urls) or bool(link_clue),
        severity="critical" if ("PHISHING_URL_EXTERNAL_INTEL" in evidence_codes or "PHISHING_URL_HOMOGLYPH" in evidence_codes) else ("high" if (is_link or link_clue) else "safe"),
        explanation=(
            "The message routes you to an unverified web destination, disposable TLD, or an off-platform Telegram channel / bot (@bot, t.me/...). "
            "Scammers force victims off protected platforms to avoid anti-fraud monitoring and obscure their digital trail."
            if (is_link or urls or link_clue)
            else "No phishing, homoglyph links, or suspicious off-platform redirect traps identified."
        ),
        evidence_snippet=link_clue or ("Off-platform Telegram/channel redirect" if is_link else None),
    )

    return [f1, f2, f3, f4, f5]
