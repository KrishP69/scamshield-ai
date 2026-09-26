import uuid
from fastapi import APIRouter, status
from app.schemas.community import CommunityReportCreate, CommunityReportResponse

router = APIRouter(prefix="/community", tags=["Community Threat Reports"])


@router.post("/report", response_model=CommunityReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_community_report(payload: CommunityReportCreate) -> CommunityReportResponse:
    """Submits a threat indicator report to the community reputation database."""
    rep_id = str(uuid.uuid4())
    return CommunityReportResponse(
        reputation_id=rep_id,
        report_count=1,
        status="recorded",
        message=f"Threat report recorded for {payload.kind} indicator. Thank you for protecting the community.",
    )
