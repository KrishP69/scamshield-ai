from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import ModuleStatus, RiskLevel
from app.schemas.finding import Evidence


class ModuleSummary(BaseModel):
    name: str = Field(..., description="Module identifier (e.g. scam_guardian, link_scanner)")
    status: ModuleStatus = Field(..., description="Execution status: done, failed, skipped, not_checked")
    score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Risk score output")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Module confidence")
    source: Optional[str] = Field(None, description="model, rule, external_api, or offline_fallback")
    latency_ms: Optional[int] = Field(None, ge=0, description="Execution time in ms")


class IndicatorSummary(BaseModel):
    urls: List[str] = Field(default_factory=list)
    wallets: List[str] = Field(default_factory=list)
    phones: List[str] = Field(default_factory=list)
    usernames: List[str] = Field(default_factory=list)
    files: List[str] = Field(default_factory=list)


class ThreatFactor(BaseModel):
    category: str = Field(..., description="Coercion, Authority, Financial, Credential, or Destination")
    title: str = Field(..., description="Human readable factor title")
    is_triggered: bool = Field(..., description="Whether this threat factor is present")
    severity: str = Field(default="safe", description="critical, high, medium, low, or safe")
    explanation: str = Field(..., description="Detailed explanation of WHY this factor makes it fishy")
    evidence_snippet: Optional[str] = Field(None, description="Actual excerpt or indicator extracted from text")


class TrustPassport(BaseModel):
    scan_id: str = Field(..., description="Unique scan execution identifier")
    risk_score: int = Field(..., ge=0, le=100, description="Calibrated risk index (0-100)")
    level: RiskLevel = Field(..., description="LOW, CAUTION, HIGH, CRITICAL, or INCONCLUSIVE")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Composite confidence level")
    scam_type: Optional[str] = Field(None, description="Primary scam typology (e.g. marketplace_advance_payment)")
    reasons: List[Evidence] = Field(..., description="Top 3 to 6 sorted explainable evidence items with highlights")
    factors: List[ThreatFactor] = Field(default_factory=list, description="Detailed threat factors explaining why this input is fishy")
    modules: List[ModuleSummary] = Field(..., description="Summary of each module's status and finding")
    indicators: IndicatorSummary = Field(default_factory=IndicatorSummary, description="Extracted indicators")
    actions: List[str] = Field(..., description="Recommended defensive action items (e.g. call 1930)")
    disclaimer: str = Field(
        default="ScamShield AI provides automated risk guidance, not legal or financial advice. In case of financial fraud, dial 1930 or visit https://cybercrime.gov.in.",
        description="Statutory legal and safety disclaimer"
    )
    created_at: str = Field(..., description="ISO-8601 creation timestamp")
    submitted_text: Optional[str] = Field(None, description="Original submitted text for display and span highlighting")
    platform: Optional[str] = Field(None, description="Source platform e.g. facebook, telegram")
