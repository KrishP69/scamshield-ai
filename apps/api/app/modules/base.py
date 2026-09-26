from typing import Any, Dict, List, Optional, Protocol
from pydantic import BaseModel, Field
from app.schemas.common import PlatformType
from app.schemas.finding import Finding


class ScanContext(BaseModel):
    scan_id: str
    raw_text: str = ""
    cleaned_text: str = ""
    platform: PlatformType = PlatformType.UNKNOWN
    entities: Dict[str, Any] = Field(default_factory=dict)
    language_info: Dict[str, Any] = Field(default_factory=dict)
    file_bytes: Optional[bytes] = None
    file_name: Optional[str] = None
    file_mime: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DetectionModule(Protocol):
    name: str

    async def analyze(self, ctx: ScanContext) -> Finding:
        """Analyzes the context and returns a standardized Finding contract."""
        ...
