from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class AdminMetrics(BaseModel):
    total_scans: int
    scans_last_24h: int
    threat_breakdown: Dict[str, int]
    avg_latency_ms: float
    adapter_health: Dict[str, str]


class LabelQueueItem(BaseModel):
    id: str
    scan_id: str
    proposed_label: str
    reviewer_label: Optional[str] = None
    created_at: str


class ReviewLabelRequest(BaseModel):
    reviewer_label: str
    notes: Optional[str] = None
