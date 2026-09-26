from pydantic import BaseModel, Field


class ShareReportRequest(BaseModel):
    expires_in_hours: int = Field(default=72, ge=1, le=720)


class ShareReportResponse(BaseModel):
    share_token: str
    share_url: str
    expires_at: str
