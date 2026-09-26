import pytest
from app.schemas.common import ModuleStatus, PlatformType, RiskLevel, ScanSource, SeverityLevel, Verdict
from app.schemas.finding import Evidence, Finding
from app.schemas.passport import IndicatorSummary, ModuleSummary, TrustPassport
from app.schemas.scan import ScanCreateRequest


def test_evidence_contract():
    evidence = Evidence(
        code="URGENCY_LANGUAGE",
        severity=SeverityLevel.HIGH,
        title="Urgent Call to Action",
        plain_text="The message pressures the recipient to act immediately.",
        source=ScanSource.RULE,
        span=(10, 35),
    )
    assert evidence.code == "URGENCY_LANGUAGE"
    assert evidence.span == (10, 35)
    assert evidence.severity == "high"


def test_finding_contract():
    finding = Finding(
        module="scam_guardian",
        score=0.92,
        confidence=0.88,
        verdict=Verdict.DANGEROUS,
        evidence=[],
        indicators={"wallets": ["0x123..."]},
        source=ScanSource.MODEL,
        latency_ms=145,
    )
    assert finding.score == 0.92
    assert finding.verdict == Verdict.DANGEROUS
    assert finding.source == ScanSource.MODEL


def test_trust_passport_serialization():
    passport = TrustPassport(
        scan_id="test-scan-123",
        risk_score=85,
        level=RiskLevel.CRITICAL,
        confidence=0.95,
        scam_type="investment_crypto",
        reasons=[
            Evidence(
                code="GUARANTEED_RETURNS",
                severity=SeverityLevel.CRITICAL,
                title="Unrealistic Guaranteed Returns",
                plain_text="Claims 300% return in 20 minutes.",
                source=ScanSource.RULE,
                span=(12, 45),
            )
        ],
        modules=[
            ModuleSummary(
                name="scam_guardian",
                status=ModuleStatus.DONE,
                score=0.95,
                confidence=0.9,
                source="model",
                latency_ms=80,
            )
        ],
        indicators=IndicatorSummary(wallets=["0x71C95911E9a5D330f4d621842EC243EE1343292e"]),
        actions=["Do not send cryptocurrency", "Report group on Telegram"],
        created_at="2026-09-26T19:00:00Z",
    )
    data = passport.model_dump()
    assert data["risk_score"] == 85
    assert data["level"] == "CRITICAL"
    assert len(data["reasons"]) == 1
    assert data["indicators"]["wallets"] == ["0x71C95911E9a5D330f4d621842EC243EE1343292e"]


@pytest.mark.asyncio
async def test_health_endpoints(client):
    res_health = await client.get("/api/v1/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "ok"

    res_ready = await client.get("/api/v1/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "ready"

    res_status = await client.get("/api/v1/status")
    assert res_status.status_code == 200
    data = res_status.json()
    assert "modules" in data
    assert "intel_adapters" in data
    assert data["helpline"]["number"] == "1930"


@pytest.mark.asyncio
async def test_create_scan_and_get(client):
    payload = {
        "text": "Send Rs. 2,000 urgently to gate pass deposit",
        "platform": "facebook",
        "store_history": False,
    }
    create_res = await client.post("/api/v1/scans", json=payload)
    assert create_res.status_code == 202
    scan_data = create_res.json()
    assert "scan_id" in scan_data
    scan_id = scan_data["scan_id"]

    get_res = await client.get(f"/api/v1/scans/{scan_id}")
    assert get_res.status_code == 200
    passport = get_res.json()
    assert passport["scan_id"] == scan_id
    assert "reasons" in passport
    assert "modules" in passport
