from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field
from app.schemas.common import ScanSource, SeverityLevel, Verdict


class Evidence(BaseModel):
    code: str = Field(..., description="Unique machine-readable reason identifier, e.g. URGENCY_LANGUAGE")
    severity: SeverityLevel = Field(..., description="Severity level: low, medium, high, or critical")
    title: str = Field(..., description="Short plain-English title")
    plain_text: str = Field(..., description="Clear explanation of the detected risk factor")
    source: ScanSource = Field(..., description="Origin of this evidence finding")
    span: Optional[Tuple[int, int]] = Field(
        None, description="Start and end character offsets in original text for inline highlighting"
    )


class Finding(BaseModel):
    module: str = Field(..., description="Identifier of the detection module (e.g. scam_guardian)")
    score: float = Field(..., ge=0.0, le=1.0, description="Risk probability score (0.0 to 1.0)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Degree of certainty (0.0 to 1.0)")
    verdict: Verdict = Field(..., description="High-level assessment: safe, suspicious, dangerous, unknown")
    evidence: List[Evidence] = Field(default_factory=list, description="Concrete displayable evidence items")
    indicators: Dict[str, Any] = Field(
        default_factory=dict, description="Extracted indicators: urls, wallets, phones, hashes"
    )
    source: ScanSource = Field(..., description="Source of the finding (model, rule, external_api, offline_fallback)")
    latency_ms: int = Field(..., ge=0, description="Processing duration in milliseconds")
