from typing import Optional
from pydantic import BaseModel, Field


class CommunityReportCreate(BaseModel):
    kind: str = Field(..., description="phone, wallet, url, or username")
    indicator_value: str = Field(..., description="The indicator value being reported")
    platform: Optional[str] = "unknown"
    note: Optional[str] = Field(None, max_length=1000)


class CommunityReportResponse(BaseModel):
    reputation_id: str
    report_count: int
    status: str
    message: str
