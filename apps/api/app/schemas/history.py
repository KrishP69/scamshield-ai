from typing import List, Optional
from pydantic import BaseModel
from app.schemas.passport import TrustPassport


class HistoryItem(BaseModel):
    id: str
    input_type: str
    platform: str
    risk_score: int
    level: str
    scam_type: Optional[str]
    passport: TrustPassport
    created_at: str


class HistoryListResponse(BaseModel):
    items: List[HistoryItem]
    total: int
    page: int
    size: int
