from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import PlatformType
from app.schemas.passport import TrustPassport


class ScanCreateRequest(BaseModel):
    text: Optional[str] = Field(None, max_length=10000, description="Raw message text to inspect")
    platform: PlatformType = Field(default=PlatformType.UNKNOWN, description="Source platform (facebook, telegram, etc.)")
    url: Optional[str] = Field(None, description="Optional link to inspect")
    phone: Optional[str] = Field(None, description="Optional phone number to check")
    username: Optional[str] = Field(None, description="Optional profile handle or username")
    wallet_address: Optional[str] = Field(None, description="Optional crypto wallet address")
    store_history: bool = Field(default=False, description="Explicit opt-in to store this scan in history")


class QuickScanRequest(BaseModel):
    url_hashes: List[str] = Field(default_factory=list, description="List of SHA-256 URL prefixes for quick lookup")
    text_snippet: Optional[str] = Field(None, max_length=500, description="Short text snippet for client-side quick check")
    platform: PlatformType = Field(default=PlatformType.UNKNOWN)


class QuickScanResponse(BaseModel):
    is_flagged: bool
    risk_hint: str
    reasons: List[str] = Field(default_factory=list)


class ScanResponse(BaseModel):
    scan_id: str
    status: str = Field(..., description="queued, running, completed, or failed")
    passport: Optional[TrustPassport] = None
