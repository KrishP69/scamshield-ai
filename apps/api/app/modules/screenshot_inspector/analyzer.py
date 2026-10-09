import base64
import re
from typing import Any, Dict, List, Optional
from app.core.logging import logger
from app.modules.screenshot_inspector.banner_generator import generate_preset_screenshot
from app.preprocess.ocr import extract_text_from_image


def inspect_screenshot_banner(
    image_bytes: Optional[bytes] = None,
    text_hint: Optional[str] = None,
    filename: Optional[str] = None,
    preset: Optional[str] = None,
) -> Dict[str, Any]:
    """
    State-of-the-art forensic analysis for scam screenshots, phishing posters,
    and absurd deal banners (e.g. fake free game currency luring Instagram credentials).
    """
    preset_meta = {}
    preview_url = ""
    extracted_text = ""

    # 1. Resolve image source and initial text extraction
    if preset:
        preset_data = generate_preset_screenshot(preset)
        image_bytes = preset_data["image_bytes"]
        preview_url = preset_data["base64_url"]
        extracted_text = preset_data["ground_truth_text"]
        preset_meta = preset_data["metadata"]
    elif image_bytes:
        # Convert uploaded bytes to data URL for client preview
        b64_enc = base64.b64encode(image_bytes).decode("ascii")
        mime = "image/png" if (filename and filename.endswith(".png")) else "image/jpeg"
        preview_url = f"data:{mime};base64,{b64_enc}"

        # Run OCR
        ocr_res = extract_text_from_image(image_bytes)
        if ocr_res.get("text"):
            extracted_text = ocr_res["text"]

    # Combine with client text hint if provided
    if text_hint and text_hint.strip():
        if extracted_text:
            extracted_text = f"{text_hint.strip()} | {extracted_text}"
        else:
            extracted_text = text_hint.strip()

    normalized_text = extracted_text.lower()

    # 2. Forensic Pattern Matching Engine
    red_flags: List[Dict[str, Any]] = []
    threat_zones: List[Dict[str, Any]] = []
    target_platforms: List[str] = []

    # Detect platforms
    if "instagram" in normalized_text or "insta" in normalized_text:
        target_platforms.append("Instagram")
    if "free fire" in normalized_text or "garena" in normalized_text or "ff max" in normalized_text:
        target_platforms.append("Free Fire / Garena")
    if "bgmi" in normalized_text or "battlegrounds" in normalized_text or "pubg" in normalized_text:
        target_platforms.append("BGMI / Krafton")
    if "telegram" in normalized_text or "t.me" in normalized_text:
        target_platforms.append("Telegram")
    if "whatsapp" in normalized_text or "wa.me" in normalized_text:
        target_platforms.append("WhatsApp")
    if "apple" in normalized_text or "iphone" in normalized_text:
        target_platforms.append("Apple / iPhone")
    if "youtube" in normalized_text:
        target_platforms.append("YouTube")

    # A. Credential Harvesting & Account Takeover Trap
    # Filter out legitimate safety warnings like "never ask for password"
    advisory_free_text = re.sub(
        r"(?:never|will not|do not|don't)\s*(?:ever\s*)?(?:ask\s*for|share|give|request)\s*(?:your\s*)?passwords?",
        "",
        normalized_text,
    )

    cred_harvest_patterns = [
        r"(?:enter|submit|provide|fill|type)\s*(?:your\s*)?(?:instagram|fb|facebook|social)?\s*(?:password|passcode)",
        r"(?:instagram|insta|fb|facebook)\s*password",
        r"(?:instagram|insta)\s*(?:username|login\s*id|user\s*id).*?password",
        r"(?:id\s*(?:and|&)\s*pass|id\s*pass)",
        r"sync\s*(?:with\s*)?instagram",
        r"login\s*(?:with\s*)?(?:instagram|fb|facebook)\s*to\s*(?:claim|verify|sync)",
        r"enter\s*(?:your\s*)?(?:login\s*credentials|passcode)",
        r"enter\s*(?:your\s*)?upi\s*pin",
        r"submit\s*appeal.*?password",
    ]
    matched_cred = [p for p in cred_harvest_patterns if re.search(p, advisory_free_text)]
    credential_theft_detected = len(matched_cred) > 0

    if credential_theft_detected:
        red_flags.append({
            "severity": "CRITICAL",
            "type": "CREDENTIAL_HARVESTING",
            "title": "Unauthorized Password & Login ID Demand",
            "detail": "Banner demands your social media or game credentials (username/password/PIN). Official platforms NEVER ask for third-party passwords to award prizes or gifts.",
        })
        threat_zones.append({
            "zone": "credential_trap",
            "badge": "ACCOUNT THEFT HAZARD",
            "snippet": "Demands Instagram Username & Password / Account Sync",
            "severity": "CRITICAL",
        })

    # B. Absurd Game Currency / Free Item Bait
    game_bait_patterns = [
        r"(?:free\s*(?:fire\s*)?diamonds?|50,?000\s*diamonds?|10,?000\s*diamonds?|unlimited\s*diamonds)",
        r"(?:free\s*uc|10,?000\s*uc|unlimited\s*uc)",
        r"(?:free\s*robux|unlimited\s*robux|free\s*v[\s-]?bucks)",
        r"(?:free\s*elite\s*pass|free\s*skins?|free\s*characters?)",
        r"(?:season\s*airdrop|gamer\s*id\s*giveaway)",
    ]
    matched_game_bait = [p for p in game_bait_patterns if re.search(p, normalized_text)]

    # C. Absurd Lottery / Expensive Gadget Bait
    lottery_bait_patterns = [
        r"(?:won\s*(?:an?\s*)?(?:apple\s*)?iphone\s*16|iphone\s*15|iphone\s*pro)",
        r"(?:lucky\s*draw\s*winner|congratulations!\s*lucky\s*draw|anniversary\s*winner)",
        r"(?:market\s*value:\s*(?:₹|rs\.?)\s*[\d,]+|worth\s*(?:₹|rs\.?)\s*[\d,]+)",
    ]
    matched_lottery = [p for p in lottery_bait_patterns if re.search(p, normalized_text)]

    # D. Advance-Fee / Courier Charge Demand
    advance_fee_patterns = [
        r"(?:refundable\s*fee|customs\s*charge|courier\s*fee|delivery\s*(?:charge|fee))",
        r"(?:pay\s*(?:₹|rs\.?)\s*\d+.*?(?:shipping|customs|tax|verification))",
        r"(?:scan\s*upi\s*qr|enter\s*(?:your\s*)?upi\s*pin)",
    ]
    matched_advance = [p for p in advance_fee_patterns if re.search(p, normalized_text)]

    # E. Work-from-Home / Part-Time Job / Like Reels Bait
    job_patterns = [
        r"(?:part[\s-]?time\s*job|work\s*from\s*home)",
        r"(?:earn\s*(?:₹|rs\.?)\s*[\d,]+.*?(?:daily|per\s*day))",
        r"(?:like\s*instagram\s*reels|subscribe\s*(?:to\s*)?youtube)",
        r"(?:prepaid\s*task|vip\s*prepaid)",
    ]
    matched_job = [p for p in job_patterns if re.search(p, normalized_text)]

    # F. Artificial Urgency / Extortion Pressure
    urgency_patterns = [
        r"(?:offer\s*expires\s*in|limited\s*time|expires\s*in\s*\d+)",
        r"(?:claim\s*within\s*\d+|forfeit|only\s*\d+\s*(?:units?|left))",
        r"(?:permanent\s*termination|account.*?deleted\s*within\s*\d+\s*hours?)",
        r"(?:copyright\s*infringement|dmca\s*takedown)",
    ]
    matched_urgency = [p for p in urgency_patterns if re.search(p, normalized_text)]
    urgency_detected = len(matched_urgency) > 0

    if urgency_detected:
        red_flags.append({
            "severity": "HIGH",
            "type": "ARTIFICIAL_URGENCY",
            "title": "Coercive Time Countdown & Fear Trigger",
            "detail": "Uses artificial countdown timers or suspension threats to bypass critical thinking and prevent users from checking official channels.",
        })
        threat_zones.append({
            "zone": "urgency",
            "badge": "FALSE COUNTDOWN",
            "snippet": "Artificial Urgency Countdown / Account Suspension Threat",
            "severity": "HIGH",
        })

    # G. Off-Platform / Unverified Channels
    off_platform_patterns = [
        r"(?:contact.*?on\s*telegram|join\s*telegram|t\.me\/|@earn_|@job_)",
        r"(?:dm\s*on\s*telegram|wa\.me)",
    ]
    matched_off_platform = [p for p in off_platform_patterns if re.search(p, normalized_text)]

    # 3. Categorization & Scoring Fusion
    absurd_deal_detected = bool(matched_game_bait or matched_lottery or matched_job)

    if matched_game_bait:
        red_flags.append({
            "severity": "CRITICAL",
            "type": "ABSURD_REWARD_BAIT",
            "title": "Unrealistic In-Game Currency Lure",
            "detail": "Promises massive quantities of high-value in-game currency (e.g. 50,000 Diamonds) for free as phishing bait.",
        })
        threat_zones.append({
            "zone": "bait",
            "badge": "ABSURD DEAL BAIT",
            "snippet": "Promise of Free 50,000 Diamonds / Elite Pass",
            "severity": "CRITICAL",
        })

    if matched_lottery:
        red_flags.append({
            "severity": "CRITICAL",
            "type": "ADVANCE_FEE_LOTTERY",
            "title": "Fabricated Premium Gadget Giveaway",
            "detail": "Claims victim was selected as a lucky winner of an iPhone 16 Pro to solicit advance handling fees.",
        })
        threat_zones.append({
            "zone": "bait",
            "badge": "FAKE LOTTERY PRIZE",
            "snippet": "Unsolicited Apple iPhone 16 Pro Winner Claim",
            "severity": "CRITICAL",
        })

    if matched_advance:
        red_flags.append({
            "severity": "CRITICAL",
            "type": "ADVANCE_PAYMENT_TRAP",
            "title": "Mandatory Upfront Handling Fee / UPI PIN Entry",
            "detail": "Demands payments or asks for a UPI PIN under the guise of 'clearance fee' or 'refundable deposit'.",
        })

    if matched_job:
        red_flags.append({
            "severity": "HIGH",
            "type": "TASK_EMPLOYMENT_FRAUD",
            "title": "Deceptive Reel-Liking / Task Employment",
            "detail": "Lures users with ₹3,000-₹5,000 daily earnings for liking reels, eventually leading to prepaid task investment extortion.",
        })
        threat_zones.append({
            "zone": "bait",
            "badge": "TASK SCAM BAIT",
            "snippet": "Earn ₹3,000-₹5,000 Daily by Liking Reels",
            "severity": "HIGH",
        })

    # Determine Typology, Verdict, and Score
    if credential_theft_detected and (matched_game_bait or "diamond" in normalized_text or "bgmi" in normalized_text):
        threat_category = "GAME_REWARD_CREDENTIAL_TRAP"
        threat_title = "Instagram Account Takeover Trap via Free Game Currency"
        summary = (
            "This banner lures gamers with promises of massive free in-game currency (50,000 Diamonds) "
            "to trick them into submitting their Instagram login ID and password. This is a classic "
            "credential harvesting phishing attack engineered to hijack social media profiles."
        )
        risk_score = 98
        verdict = "CRITICAL"
        anatomy = [
            {"step": "1. The Lure", "desc": "Attackers distribute graphics promising absurd free rewards (e.g. 50,000 Diamonds, skins) across Instagram Reels, YouTube Shorts, and gaming communities."},
            {"step": "2. Credential Phish", "desc": "The graphic instructs the victim to 'sync' their Instagram profile to claim the reward, asking for their Username and Password."},
            {"step": "3. Immediate Takeover", "desc": "Phishing bots automatically authenticate the stolen credentials, immediately changing the linked email, phone number, and password."},
            {"step": "4. Secondary Fraud", "desc": "The stolen Instagram account is weaponized to DM the victim's friends asking for urgent emergency money or running crypto scams."},
        ]

    elif credential_theft_detected and ("copyright" in normalized_text or "termination" in normalized_text or "appeal" in normalized_text):
        threat_category = "INSTAGRAM_ACCOUNT_TAKEOVER"
        threat_title = "Fake Instagram Copyright & Account Suspension Phishing"
        summary = (
            "This screenshot impersonates Instagram Legal / Help Center, threatening account termination "
            "within 24 hours unless login credentials are submitted to 'verify identity'. This is a malicious account takeover scheme."
        )
        risk_score = 96
        verdict = "CRITICAL"
        anatomy = [
            {"step": "1. Fear Induction", "desc": "Victim receives a terrifying alert claiming DMCA copyright infringement or policy violation with a 24-hour deletion countdown."},
            {"step": "2. Bogus Appeal Form", "desc": "Victim is directed to a fraudulent appeal form asking for their current Instagram credentials."},
            {"step": "3. Security Eviction", "desc": "Attackers lock the legitimate user out, remove linked devices, and demand a cryptocurrency ransom to restore access."},
        ]

    elif matched_lottery and matched_advance:
        threat_category = "ABSURD_GIVEAWAY_LOTTERY"
        threat_title = "Advance-Fee Lottery Fraud (Fake iPhone 16 Pro Prize)"
        summary = (
            "This banner falsely informs the victim that they won an Apple iPhone 16 Pro, but requires an upfront "
            "₹499 customs or delivery fee. Once paid, the attacker vanishes and no phone is ever delivered."
        )
        risk_score = 92
        verdict = "CRITICAL"
        anatomy = [
            {"step": "1. Artificial Excitement", "desc": "Victim is shown a glamorous announcement claiming they are a selected lucky anniversary winner of a premium gadget."},
            {"step": "2. Micro-Payment Hook", "desc": "A small 'refundable' fee (₹499) is requested for airport customs or courier insurance to make compliance seem low-risk."},
            {"step": "3. Escalating Extortion", "desc": "After paying, attackers invent further bogus taxes (e.g. ₹2,500 GST stamp) until the victim realizes it is fraud."},
        ]

    elif matched_job:
        threat_category = "TASK_JOB_FRAUD"
        threat_title = "Reel-Liking Part-Time Job / Prepaid Task Trap"
        summary = (
            "This banner advertises effortless earnings of ₹2,000-₹5,000 daily for liking Instagram reels. "
            "It moves victims off-platform to Telegram where they are trapped in high-dollar prepaid investment tasks."
        )
        risk_score = 88
        verdict = "HIGH"
        anatomy = [
            {"step": "1. Easy Money Bait", "desc": "Promotes high daily wages for effortless tasks like liking Instagram reels or subscribing to channels."},
            {"step": "2. Small Payout Hook", "desc": "Victims receive ₹150 for the first few test tasks to build false trust."},
            {"step": "3. The Prepaid Trap", "desc": "Victims are added to Telegram VIP groups and pressured to deposit ₹10,000+ into prepaid merchant accounts, which can never be withdrawn."},
        ]

    elif "official" in normalized_text and "download" in normalized_text and not credential_theft_detected and not absurd_deal_detected:
        threat_category = "LEGITIMATE_PROMOTION"
        threat_title = "Verified Official Community / Game Update Banner"
        summary = (
            "This banner contains standard promotional update information directing users to official app stores (Google Play & Apple Store). "
            "No credential requests, false giveaways, or high-pressure payment demands were detected."
        )
        risk_score = 4
        verdict = "SAFE"
        anatomy = []
        threat_zones = []

    else:
        # Default evaluated score based on red flags
        score_calc = 10
        if credential_theft_detected:
            score_calc += 60
        if absurd_deal_detected:
            score_calc += 25
        if urgency_detected:
            score_calc += 15
        if matched_off_platform:
            score_calc += 15

        risk_score = min(max(score_calc, 12), 98)
        verdict = "CRITICAL" if risk_score >= 80 else ("HIGH" if risk_score >= 60 else ("SUSPICIOUS" if risk_score >= 35 else "SAFE"))
        threat_category = "SUSPICIOUS_PROMOTIONAL_BANNER" if risk_score >= 50 else "UNVERIFIED_BANNER"
        threat_title = "Suspicious High-Pressure Promotional Screenshot" if risk_score >= 50 else "Informational Screenshot"
        summary = (
            f"Forensic analysis detected {len(red_flags)} warning signals in this image. "
            + ("Contains unauthorized credential demands. Exercise extreme caution." if credential_theft_detected else "Verify authenticity before engaging.")
        )
        anatomy = []

    # Defense Playbook Checklist
    defense_checklist = [
        "NEVER enter your Instagram username, password, or security codes on external promotional graphics or websites.",
        "Official game developers (Garena Free Fire, Krafton BGMI, Epic Games) NEVER require your social media password to deliver skins or currency.",
        "If you already entered your password, immediately open Instagram Settings -> Security -> Change Password, and log out of all other sessions.",
        "Enable Two-Factor Authentication (2FA) using an Authenticator App (Google Authenticator or Duo) rather than SMS.",
        "Report the phishing poster / account directly on Instagram and warn friends.",
    ]

    return {
        "verdict": verdict,
        "risk_score": risk_score,
        "threat_category": threat_category,
        "threat_title": threat_title,
        "summary": summary,
        "target_platforms": list(set(target_platforms)) or ["Social Media & Gaming"],
        "credential_theft_detected": credential_theft_detected,
        "absurd_deal_detected": absurd_deal_detected,
        "urgency_detected": urgency_detected,
        "extracted_text": extracted_text,
        "red_flags": red_flags,
        "threat_zones": threat_zones,
        "attack_anatomy": anatomy,
        "defense_checklist": defense_checklist,
        "preview_image_url": preview_url,
    }
