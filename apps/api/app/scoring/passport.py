from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.core.config import settings
from app.modules.base import ScanContext
from app.schemas.common import ModuleStatus, RiskLevel
from app.schemas.finding import Evidence, Finding
from app.schemas.passport import IndicatorSummary, ModuleSummary, TrustPassport
from app.scoring.fusion import calculate_fusion_score
from app.scoring.reasons import synthesize_reasons
from app.scoring.rules import apply_hard_rules

# Concrete defensive recommendations mapped by scam typology (Section 8.5)
ACTION_RECOMMENDATIONS: Dict[str, List[str]] = {
    "marketplace_advance_payment": [
        "Do not transfer any advance payment, gate pass fee, or courier charge.",
        "Refuse off-platform payment requests; insist on cash/UPI on in-person physical handover.",
        f"If funds were already transferred, immediately dial {settings.CYBER_HELPLINE_NUMBER} and report to {settings.CYBER_PORTAL_URL}.",
    ],
    "cloned_friend_account": [
        "Do not send funds to the new UPI ID or phone number.",
        "Directly call your friend or their family members on their known original number to verify.",
        "Report the fake cloned profile to the respective social platform.",
    ],
    "kyc_bank_upi": [
        "Never click links sent via SMS/chat claiming your bank account or KYC is suspended.",
        "Do not disclose your NetBanking password, debit card details, or UPI PIN.",
        "Verify your account status exclusively via official banking apps or by visiting your branch.",
    ],
    "investment_crypto": [
        "Never send cryptocurrency to pools promising guaranteed multiplier returns.",
        "Never enter your 12-word seed phrase or private keys on external sites or bots.",
        "Leave and report the scam channel on Telegram.",
    ],
    "airdrop_giveaway": [
        "Do not connect your primary crypto wallet to unverified airdrop claims.",
        "Never sign transactions requesting unlimited token spend permissions.",
        "Revoke any suspicious smart contract allowances via Revoke.cash.",
    ],
    "suspicious_apk": [
        "Immediately uninstall the downloaded APK file from your device.",
        "Check Settings > Accessibility and turn off unknown accessibility services.",
        "Run a Google Play Protect scan and review your banking apps for unauthorized activity.",
    ],
    "default_high": [
        "Cease all communication with the sender immediately.",
        "Block the sender and preserve chat screenshots as evidence.",
        f"If financial fraud occurred, call national cybercrime helpline {settings.CYBER_HELPLINE_NUMBER}.",
    ],
    "default_low": [
        "No red flags detected in the checks run.",
        "Continue normal interaction while observing standard digital safety precautions.",
    ],
}


def get_recommended_actions(scam_type: Optional[str], level: RiskLevel) -> List[str]:
    """Retrieves specific actionable recommendations based on detected scam typology."""
    if level in (RiskLevel.CRITICAL, RiskLevel.HIGH):
        if scam_type and scam_type in ACTION_RECOMMENDATIONS:
            return ACTION_RECOMMENDATIONS[scam_type]
        return ACTION_RECOMMENDATIONS["default_high"]
    elif level == RiskLevel.CAUTION:
        return [
            "Exercise caution before replying or sharing any personal details.",
            "Verify the identity of the sender independently through a trusted channel.",
        ]
    elif level == RiskLevel.INCONCLUSIVE:
        return [
            "Scan inconclusive due to partial threat intelligence availability.",
            "Avoid sharing financial details or clicking links until verified.",
        ]
    else:
        return ACTION_RECOMMENDATIONS["default_low"]


def build_trust_passport(
    scan_id: str,
    findings: List[Finding],
    context: ScanContext,
    target_lang: str = "en",
) -> TrustPassport:
    """
    Compiles final Trust Passport:
    1. Computes compounded fusion score via Noisy-OR
    2. Applies deterministic hard-rule overrides
    3. Synthesizes bilingual explainable reasons with spans
    4. Gathers extracted indicators
    5. Formulates recommended actions
    """
    # 1. Evidence fusion
    raw_risk = calculate_fusion_score(findings)

    # 2. Hard-rule overrides
    risk_score, level = apply_hard_rules(raw_risk, findings)

    # Calculate composite confidence
    if findings:
        avg_conf = sum(f.confidence for f in findings) / len(findings)
    else:
        avg_conf = 0.5

    # Identify primary scam type from findings
    primary_scam_type = None
    for f in findings:
        predicted = f.indicators.get("predicted_scam_type")
        if predicted and predicted != "legit":
            primary_scam_type = predicted
            break

    # If score is low and no scam found, mark as legit
    if level == RiskLevel.LOW and not primary_scam_type:
        primary_scam_type = "legit"

    # 3. Synthesize explainable reasons
    reasons = synthesize_reasons(findings, target_lang=target_lang)

    # If low risk and no reasons, supply clear reassuring message
    if not reasons and level == RiskLevel.LOW:
        reasons.append(
            Evidence(
                code="NO_RED_FLAGS",
                severity="low",
                title="No Threat Patterns Detected",
                plain_text="No manipulation tactics, advance payment demands, or known phishing signatures were detected.",
                source="rule",
                span=None,
            )
        )

    # 4. Modules execution summary
    all_modules = [
        "scam_guardian",
        "link_scanner",
        "reverse_search",
        "crypto_detector",
        "file_scanner",
        "voice_verifier",
    ]
    findings_map = {f.module: f for f in findings}
    module_summaries: List[ModuleSummary] = []

    for mod_name in all_modules:
        if mod_name in findings_map:
            f = findings_map[mod_name]
            module_summaries.append(
                ModuleSummary(
                    name=mod_name,
                    status=ModuleStatus.DONE,
                    score=f.score,
                    confidence=f.confidence,
                    source=f.source,
                    latency_ms=f.latency_ms,
                )
            )
        else:
            module_summaries.append(
                ModuleSummary(
                    name=mod_name,
                    status=ModuleStatus.NOT_CHECKED,
                )
            )

    # 5. Extract indicators
    entities = context.entities or {}
    indicator_summary = IndicatorSummary(
        urls=entities.get("urls", []),
        wallets=[w.get("address", "") if isinstance(w, dict) else str(w) for w in entities.get("wallets", [])],
        phones=[p.get("e164", "") if isinstance(p, dict) else str(p) for p in entities.get("phones", [])],
        usernames=entities.get("usernames", []),
    )

    # 6. Prescribe actions
    actions = get_recommended_actions(primary_scam_type, level)

    return TrustPassport(
        scan_id=scan_id,
        risk_score=risk_score,
        level=level,
        confidence=round(avg_conf, 2),
        scam_type=primary_scam_type,
        reasons=reasons,
        modules=module_summaries,
        indicators=indicator_summary,
        actions=actions,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
