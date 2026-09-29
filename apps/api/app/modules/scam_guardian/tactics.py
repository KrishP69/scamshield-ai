import re
from typing import Dict, List, Tuple
from app.schemas.common import ScanSource, SeverityLevel
from app.schemas.finding import Evidence

# Lexicon and Regex rules for manipulation tactics (Blueprint Section 7.1)
TACTIC_RULES: Dict[str, Dict[str, any]] = {
    "urgency": {
        "title": "Artificial Urgency & Time Pressure",
        "severity": SeverityLevel.HIGH,
        "plain_text": "The message pressures you to act immediately (e.g. within minutes or hours) to trigger panic and bypass rational skepticism.",
        "patterns": [
            r"\b(?:within\s*\d+\s*(?:mins?|minutes?|hours?|hrs?|days?)|in\s*\d+\s*(?:mins?|minutes?|hours?))\b",
            r"\b(?:immediately|urgently|right now|hurry|asap|fast|act now|limited time|last chance)\b",
            r"\b(?:deactivated today|account blocked today|expire in \d+|suspended today)\b",
            r"\b(?:terminated|deleted|suspended|blocked)\s*(?:in|within)\s*\d+\s*(?:hours?|hrs?|minutes?)\b",
            r"\b(?:urgent\s*notice|account\s*action\s*required|take\s*action\s*now)\b",
            r"\b(?:turant|jaldi|abhi)\b",
        ],
    },
    "fake_authority": {
        "title": "Impersonation of Authority or Official Organization",
        "severity": SeverityLevel.HIGH,
        "plain_text": "Claims to represent the Indian Army, Police, Cyber Cell, Bank, Telegram Support, or Government official to coerce compliance.",
        "patterns": [
            r"\b(?:indian army|cantonment|defence personnel|military truck|army officer|colonel|subedar)\b",
            r"\b(?:police officer|delhi police|mumbai police|cbi|ed|customs department|cyber crime cell|narcotics\s*control\s*bureau|ncb)\b",
            r"\b(?:sbi yono|hdfc bank|icici bank|rbi official|income tax department|bank manager)\b",
            r"\b(?:telegram\s*(?:support|security|team|bot|notification|official|admin|helpdesk))\b",
            r"\b(?:amazon\s*(?:hr|manager|hiring)|flipkart\s*(?:hr|manager)|youtube\s*(?:manager|supervisor))\b",
            r"\b(?:electricity\s*(?:officer|department|board|substation))\b",
            r"\b(?:fauj|fauji|police thana)\b",
        ],
    },
    "advance_payment_request": {
        "title": "Advance Payment / Deposit Demand",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Demands an advance payment, gate pass fee, or courier security deposit before delivering goods, jobs, or rewards.",
        "patterns": [
            r"\b(?:transfer (?:rs\.?|inr|₹|\$)?\s*\d+.*?(?:advance|deposit|security|gate pass|fee|charge))\b",
            r"\b(?:pay (?:rs\.?|inr|₹|\$)?\s*\d+.*?(?:advance|deposit|charges|fee|tax))\b",
            r"\b(?:gate pass|courier deposit|registration fee|refundable fee|clearance fee|processing fee)\b",
            r"\b(?:membership\s*fee|vip\s*fee|advance\s*booking)\b",
            r"\b(?:scan\s*(?:this\s*)?qr\s*code\s*(?:and|to)\s*(?:enter|put)\s*upi\s*pin)\b",
            r"\b(?:advance payment|advance bhejo)\b",
        ],
    },
    "off_platform_move": {
        "title": "Attempt to Move Off-Platform",
        "severity": SeverityLevel.HIGH,
        "plain_text": "Encourages you to leave the safety of the verified platform to chat on an untracked Telegram channel, bot, or WhatsApp number.",
        "patterns": [
            r"\b(?:t\.me\/[a-zA-Z0-9_+/.-]+|wa\.me\/[0-9+]+)\b",
            r"\b(?:message (?:me|our)?\s*on whatsapp|dm (?:me|our)?\s*on telegram|chat on telegram|text on whatsapp)\b",
            r"\b(?:join\s*(?:our\s*)?(?:telegram|whatsapp|vip|insider)\s*(?:channel|group))\b",
            r"\b(?:contact|dm|message|text)\s*(?:me|us|our)?\s*(?:receptionist|manager|supervisor|admin|hr|support)?\s*(?:on\s*telegram|on\s*whatsapp|via\s*telegram)\b",
            r"\b(?:telegram\s*(?:pe|me)|whatsapp\s*(?:pe|me))\b",
            r"(?:^|\s)@([a-zA-Z0-9_]{4,32})\b",
        ],
    },
    "too_good_to_be_true": {
        "title": "Unrealistic Financial Returns or Multiplier Trap",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Promises guaranteed multiplier returns (2x/3x/5x), 200%-500% profit, free lottery jackpots, or lucrative daily income for effortless tasks.",
        "patterns": [
            r"\b(?:guaranteed \d+x|instant \d+x|receive \d+x back|double your (?:money|crypto|bitcoin|usdt|investment))\b",
            r"\b(?:\d+%\s*(?:to|-)\s*\d+%\s*(?:guaranteed\s*)?(?:profit|returns?|roi)|\d+%\s*(?:daily|weekly|instant)\s*(?:profit|returns?|roi))\b",
            r"\b(?:guaranteed\s*(?:\d+%)?\s*profit|100%\s*(?:win\s*rate|profit|recovery))\b",
            r"\b(?:send\s*(?:\$|rs\.?|₹)?\s*[\d,]+\s*(?:usdt|eth|btc|dollars?|inr).*?(?:get|receive|payout)\s*(?:\$|rs\.?|₹)?\s*[\d,]+)\b",
            r"\b(?:invest\s*[\d,]+.*?(?:get|earn)\s*[\d,]+|invest\s*1000\s*get\s*5000)\b",
            r"\b(?:vip\s*(?:crypto\s*)?signals?|(?:telegram\s*)?pump\s*group|coin\s*will\s*pump\s*[\d,]+%|next\s*1000x\s*gem|passive\s*income\s*smart\s*contract)\b",
            r"\b(?:won (?:rs\.?|₹|\$)\s*[\d,]+.*?(?:lottery|prize|reward|jackpot|lucky\s*draw|giveaway|airdrop|usdt|dollars?))\b",
            r"\b(?:like and earn|youtube subscribe task|daily 5000 income)\b",
        ],
    },
    "secrecy_isolation": {
        "title": "Secrecy & Isolation Tactic",
        "severity": SeverityLevel.HIGH,
        "plain_text": "Instructs you not to contact family, call officials, or speak openly, deliberately isolating you from second opinions.",
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
        "plain_text": "Claims to be a known contact using a new or temporary number because their phone was lost, broken, or stolen.",
        "patterns": [
            r"\b(?:this is my new (?:temporary )?number|lost my old phone|new whatsapp number)\b",
            r"\b(?:hi dear,? lost my old phone|pehechana mujhe|mera naya number)\b",
        ],
    },
    "credential_request": {
        "title": "Unauthorized Credential or Security Key Request",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Demands your seed phrase, private key, OTP, login code, or UPI PIN. Legitimate services NEVER ask for these secrets.",
        "patterns": [
            r"\b(?:seed\s*phrase|private\s*key|recovery\s*phrase|12[\s-]?words?|secret\s*keys?)\b",
            r"\b(?:enter\s*(?:your\s*)?(?:otp|pin|password|login\s*code|verification\s*code)|share\s*(?:your\s*)?(?:otp|login\s*code|pin)|send\s*.*?(?:login\s*code|verification\s*code|otp|sms\s*code))\b",
            r"\b(?:upi\s*pin|atm\s*pin|cvv|netbanking\s*password)\b",
            r"\b(?:login\s*code|verification\s*code|tell\s*me\s*otp)\b",
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
    "task_job_scam": {
        "title": "Fake Part-Time Job / Telegram Task Scam",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Lures with daily earnings for liking YouTube videos, rating apps on Google Play, reviewing hotels on Google Maps, or completing prepaid Telegram tasks.",
        "patterns": [
            r"\b(?:part[\s-]?time\s*(?:job|work)|work\s*from\s*home|high\s*commission\s*online\s*work)\b",
            r"\b(?:like\s*(?:youtube|videos?)|subscribe\s*channel|hotel\s*(?:rating|review)|google\s*maps\s*rating|rating\s*apps?|play\s*store\s*rating)\b",
            r"\b(?:earn\s*(?:rs\.?|₹|\$)?\s*[\d,]+\s*(?:to\s*[\d,]+\s*)?(?:daily|per\s*day|every\s*day|per\s*like))\b",
            r"\b(?:daily\s*(?:salary|income|earnings?|payout)\s*(?:rs\.?|₹|\$)?\s*[\d,]+)\b",
            r"\b(?:prepaid\s*task|merchant\s*task|task\s*(?:receptionist|manager|supervisor))\b",
            r"\b(?:online\s*earning\s*task|telegram\s*task\s*(?:group|channel)|youtube\s*like\s*job)\b",
        ],
    },
    "utility_electricity_scam": {
        "title": "Fake Electricity / Utility Disconnection Threat",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Threatens immediate power or utility disconnection tonight due to un-updated bills, coercing you to call a fake officer.",
        "patterns": [
            r"\b(?:electricity\s*(?:will\s*be\s*|line\s*will\s*be\s*)?disconnected|power\s*(?:cut|disconnection))\b",
            r"\b(?:previous\s*month\s*bill|bill\s*not\s*updated|bijli\s*bill|sub[\s-]?station)\b",
            r"\b(?:contact\s*(?:with\s*)?(?:our\s*)?electricity\s*officer|call\s*electricity\s*department)\b",
            r"\b(?:disconnected\s*at\s*9[\.:]30|power\s*will\s*be\s*cut)\b",
        ],
    },
    "digital_arrest_customs": {
        "title": "Digital Arrest / Customs Narcotics Parcel Scam",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Fabricates a seized DHL/FedEx parcel with drugs or contraband, demanding immediate video call interrogation and bank verification under threat of arrest.",
        "patterns": [
            r"\b(?:fedex|dhl|customs|narcotics\s*control\s*bureau|ncb)\b.*?\b(?:parcel|drugs|mdma|contraband|illegal|passports?|seized|confiscated|on\s*hold)\b",
            r"\b(?:digital\s*arrest|interrogation\s*on\s*(?:skype|video\s*call|telegram))\b",
            r"\b(?:non[\s-]?bailable\s*warrant|cbi\s*officer|money\s*laundering\s*case|delhi\s*airport\s*customs)\b",
            r"\b(?:customs\s*parcel\s*seized|parcel\s*from\s*(?:mumbai|taiwan|london))\b",
        ],
    },
    "lottery_reward_scam": {
        "title": "Fake Lottery / KBC Lucky Draw Scam",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Claims your phone number won a multi-lakh lottery (KBC/Lucky Draw) and requires an advance processing tax to release funds.",
        "patterns": [
            r"\b(?:kbc\s*(?:lottery|lucky\s*draw)|all\s*india\s*sim\s*card\s*winner|jio\s*lucky\s*draw)\b",
            r"\b(?:won\s*(?:rs\.?|₹|\$)?\s*[\d,]+\s*(?:lakhs?|crores?|usdt|dollars?)|lottery\s*winner|lucky\s*draw\s*winner)\b",
            r"\b(?:processing\s*fee\s*to\s*claim|release\s*cheque|lottery\s*manager|rana\s*pratap\s*singh)\b",
            r"\b(?:kbc\s*head\s*office)\b",
        ],
    },
    "loan_app_extortion": {
        "title": "Predatory Loan App & Blackmail Extortion",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Offers instant loans without credit checks, then blackmails victims by threatening to distribute morphed photos to contact lists.",
        "patterns": [
            r"\b(?:without\s*cibil|zero\s*cibil|no\s*cibil|instant\s*loan|no\s*income\s*proof\s*loan|fast\s*loan\s*rupee|install\s*apk|download\s*apk)\b",
            r"\b(?:morphed\s*(?:photos?|pictures?)|send\s*to\s*(?:all\s*)?(?:contacts?|relatives?|family|facebook\s*friends))\b",
            r"\b(?:defame\s*you|blackmail|overdue\s*penalty)\b",
        ],
    },
    "telegram_gift_bot_scam": {
        "title": "Fake Telegram Gift / Free Premium Bot Trap",
        "severity": SeverityLevel.CRITICAL,
        "plain_text": "Offers free Telegram Premium, Telegram Stars, or crypto airdrop bots to phish verification login codes or crypto seed phrases.",
        "patterns": [
            r"\b(?:telegram\s*premium\s*free|free\s*telegram\s*premium|claim\s*telegram\s*gift)\b",
            r"\b(?:free\s*(?:\d+\s*)?stars\s*on\s*telegram|claim\s*free\s*telegram\s*stars)\b",
            r"\b(?:airdrop\s*bot|gift\s*bot|telegram\s*airdrop|gift\s*card\s*code)\b",
            r"\b(?:t\.me\/[a-zA-Z0-9_]*(?:bot|gift|airdrop|claim|star|premium))\b",
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
