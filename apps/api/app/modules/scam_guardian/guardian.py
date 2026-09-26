import time
from typing import List
from app.modules.base import DetectionModule, ScanContext
from app.modules.scam_guardian.baseline import baseline_classifier
from app.modules.scam_guardian.tactics import detect_tactics
from app.schemas.common import ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding


class ScamGuardianModule:
    name: str = "scam_guardian"

    async def analyze(self, ctx: ScanContext) -> Finding:
        start_time = time.time()
        text = ctx.cleaned_text or ctx.raw_text

        if not text.strip():
            return Finding(
                module=self.name,
                score=0.0,
                confidence=1.0,
                verdict=Verdict.SAFE,
                evidence=[],
                indicators={},
                source=ScanSource.RULE,
                latency_ms=0,
            )

        # 1. Rule-based manipulation tactic detection (with span attribution)
        tactic_evidence: List[Evidence] = detect_tactics(text)

        # 2. Baseline ML classification
        predicted_type, model_conf = baseline_classifier.predict(text)

        # 3. Calculate module risk score
        # Base score from tactics
        critical_count = sum(1 for e in tactic_evidence if e.severity == SeverityLevel.CRITICAL)
        high_count = sum(1 for e in tactic_evidence if e.severity == SeverityLevel.HIGH)
        medium_count = sum(1 for e in tactic_evidence if e.severity == SeverityLevel.MEDIUM)

        if predicted_type == "legit" and not tactic_evidence:
            score = 0.05
            confidence = model_conf
            verdict = Verdict.SAFE
        else:
            # Compound risk based on tactics and predicted scam type
            raw_risk = (critical_count * 0.45) + (high_count * 0.25) + (medium_count * 0.10)
            if predicted_type != "legit":
                raw_risk += 0.35
            score = min(max(raw_risk, 0.15), 0.98)
            min_conf = 0.92 if critical_count > 0 else (0.82 if tactic_evidence else 0.65)
            confidence = max(model_conf, min_conf)
            verdict = Verdict.DANGEROUS if score >= 0.70 else (Verdict.SUSPICIOUS if score >= 0.30 else Verdict.SAFE)

        # Add typology evidence if flagged as scam
        evidence_list = list(tactic_evidence)
        if predicted_type != "legit":
            evidence_list.insert(
                0,
                Evidence(
                    code=f"TYPOLOGY_{predicted_type.upper()}",
                    severity=SeverityLevel.HIGH if score >= 0.70 else SeverityLevel.MEDIUM,
                    title=f"Detected Typology: {predicted_type.replace('_', ' ').title()}",
                    plain_text=f"Language and conversation patterns closely match known {predicted_type.replace('_', ' ')} scams.",
                    source=ScanSource.MODEL,
                    span=None,
                )
            )

        latency_ms = int((time.time() - start_time) * 1000)

        return Finding(
            module=self.name,
            score=round(score, 2),
            confidence=round(confidence, 2),
            verdict=verdict,
            evidence=evidence_list,
            indicators={
                "predicted_scam_type": predicted_type,
                "tactics_count": len(tactic_evidence),
            },
            source=ScanSource.MODEL if predicted_type != "legit" else ScanSource.RULE,
            latency_ms=latency_ms,
        )


scam_guardian = ScamGuardianModule()
