from typing import Dict, List
from app.schemas.finding import Finding

# Calibrated module weights from Blueprint Section 8.1
MODULE_WEIGHTS: Dict[str, float] = {
    "link_scanner": 1.00,
    "file_scanner": 1.00,
    "crypto_detector": 1.00,
    "scam_guardian": 0.85,
    "voice_verifier": 0.70,
    "reverse_search": 0.60,
}


def calculate_fusion_score(findings: List[Finding]) -> float:
    """
    Computes compounded risk score using Noisy-OR formulation:
    contribution_i = score_i * confidence_i * weight_i
    risk_raw = 1 - Π (1 - contribution_i)
    """
    if not findings:
        return 0.0

    prod_term = 1.0
    active_findings_count = 0

    for f in findings:
        weight = MODULE_WEIGHTS.get(f.module, 0.50)
        # Bounded contribution per finding
        contribution = min(max(f.score * f.confidence * weight, 0.0), 0.99)
        prod_term *= (1.0 - contribution)
        active_findings_count += 1

    if active_findings_count == 0:
        return 0.0

    risk_raw = 1.0 - prod_term
    return min(max(risk_raw, 0.0), 1.0)
