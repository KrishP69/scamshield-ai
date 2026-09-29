from app.schemas.common import RiskLevel, ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding
from app.scoring.fusion import calculate_fusion_score
from app.scoring.reasons import synthesize_reasons
from app.scoring.rules import apply_hard_rules, evaluate_risk_level


def test_fusion_formula_noisy_or():
    # Independent moderate findings should compound into high risk
    finding_1 = Finding(
        module="scam_guardian",
        score=0.70,
        confidence=0.85,
        verdict=Verdict.DANGEROUS,
        source=ScanSource.MODEL,
        latency_ms=10,
    )
    finding_2 = Finding(
        module="link_scanner",
        score=0.60,
        confidence=0.80,
        verdict=Verdict.SUSPICIOUS,
        source=ScanSource.RULE,
        latency_ms=15,
    )

    score_single = calculate_fusion_score([finding_1])
    score_compounded = calculate_fusion_score([finding_1, finding_2])
    assert score_compounded > score_single
    assert score_compounded <= 1.0


def test_hard_rule_seed_phrase_override():
    # If credential request evidence is found, risk score is pushed to >= 85 (CRITICAL)
    findings = [
        Finding(
            module="scam_guardian",
            score=0.40,
            confidence=0.70,
            verdict=Verdict.SUSPICIOUS,
            evidence=[
                Evidence(
                    code="CREDENTIAL_REQUEST",
                    severity=SeverityLevel.CRITICAL,
                    title="Seed Phrase Demanded",
                    plain_text="Demands secret recovery phrase",
                    source=ScanSource.RULE,
                )
            ],
            source=ScanSource.RULE,
            latency_ms=10,
        )
    ]
    raw_risk = calculate_fusion_score(findings)
    score, level = apply_hard_rules(raw_risk, findings)
    assert score >= 85
    assert level == RiskLevel.CRITICAL


def test_inconclusive_override():
    findings = [
        Finding(
            module="link_scanner",
            score=0.0,
            confidence=0.0,
            verdict=Verdict.UNKNOWN,
            source=ScanSource.OFFLINE_FALLBACK,
            latency_ms=5,
        )
    ]
    score, level = apply_hard_rules(0.0, findings)
    assert level == RiskLevel.INCONCLUSIVE


def test_bilingual_reason_synthesis():
    findings = [
        Finding(
            module="scam_guardian",
            score=0.80,
            confidence=0.90,
            verdict=Verdict.DANGEROUS,
            evidence=[
                Evidence(
                    code="ADVANCE_PAYMENT_REQUEST",
                    severity=SeverityLevel.CRITICAL,
                    title="Advance Payment Demanded",
                    plain_text="Seller asks for Rs 2000 advance.",
                    source=ScanSource.RULE,
                    span=(10, 30),
                )
            ],
            source=ScanSource.RULE,
            latency_ms=10,
        )
    ]
    # English
    reasons_en = synthesize_reasons(findings, target_lang="en")
    assert len(reasons_en) == 1
    assert "advance" in reasons_en[0].plain_text.lower()

    # Hindi
    reasons_hi = synthesize_reasons(findings, target_lang="hi")
    assert len(reasons_hi) == 1
    assert "अग्रिम भुगतान" in reasons_hi[0].plain_text


def test_threat_factors_synthesis():
    from app.modules.base import ScanContext
    from app.scoring.factors import synthesize_threat_factors

    findings = [
        Finding(
            module="scam_guardian",
            score=0.85,
            confidence=0.92,
            verdict=Verdict.DANGEROUS,
            evidence=[
                Evidence(
                    code="ADVANCE_PAYMENT_REQUEST",
                    severity=SeverityLevel.CRITICAL,
                    title="Advance Fee Demanded",
                    plain_text="Demands advance gate pass fee",
                    source=ScanSource.RULE,
                ),
                Evidence(
                    code="URGENCY",
                    severity=SeverityLevel.HIGH,
                    title="Urgency Language",
                    plain_text="Within 10 minutes",
                    source=ScanSource.RULE,
                ),
            ],
            source=ScanSource.RULE,
            latency_ms=10,
        )
    ]
    ctx = ScanContext(
        scan_id="test-factors-1",
        raw_text="I am army officer transfer Rs 2000 gate pass deposit immediately within 10 minutes",
        entities={"urls": ["http://pay-gatepass.xyz"]},
    )

    factors = synthesize_threat_factors(findings, ctx)
    assert len(factors) == 5
    categories = {f.category for f in factors}
    assert categories == {"Coercion", "Identity", "Financial", "Credential", "Destination"}

    # Urgency & Coercion should be triggered
    coercion = next(f for f in factors if f.category == "Coercion")
    assert coercion.is_triggered is True
    assert "intense time pressure" in coercion.explanation

    # Financial should be triggered
    financial = next(f for f in factors if f.category == "Financial")
    assert financial.is_triggered is True
    assert "advance payment" in financial.explanation

