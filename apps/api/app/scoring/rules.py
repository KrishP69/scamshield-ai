from typing import List, Tuple
from app.schemas.common import RiskLevel, Verdict
from app.schemas.finding import Finding


def evaluate_risk_level(score: int) -> RiskLevel:
    """Maps 0-100 risk score to calibrated risk levels (Section 8.3)."""
    if score >= 75:
        return RiskLevel.CRITICAL
    elif score >= 50:
        return RiskLevel.HIGH
    elif score >= 25:
        return RiskLevel.CAUTION
    else:
        return RiskLevel.LOW


def apply_hard_rules(raw_risk: float, findings: List[Finding]) -> Tuple[int, RiskLevel]:
    """
    Applies deterministic hard-rule overrides specified in Blueprint Section 8.2:
    - Confirmed phishing/malware from external authority: score = max(score, 90)
    - Seed phrase / private key / OTP credential request: score = max(score, 85)
    - Only unknown findings (all APIs down / no data): level = INCONCLUSIVE
    """
    score = int(round(raw_risk * 100))

    # Check if all modules returned UNKNOWN verdict
    if findings and all(f.verdict == Verdict.UNKNOWN for f in findings):
        return score, RiskLevel.INCONCLUSIVE

    has_confirmed_threat = False
    has_credential_threat = False

    for f in findings:
        # Check external authority hits
        if f.module in ("link_scanner", "file_scanner") and f.score >= 0.90:
            has_confirmed_threat = True

        # Check evidence codes for credential extraction or critical advance payment
        for ev in f.evidence:
            if ev.code in ("CREDENTIAL_REQUEST", "SEED_PHRASE", "PRIVATE_KEY"):
                has_credential_threat = True

    if has_confirmed_threat:
        score = max(score, 90)
    elif has_credential_threat:
        score = max(score, 85)

    level = evaluate_risk_level(score)
    return score, level
