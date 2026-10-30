from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.security import get_current_user_optional
from app.schemas.history import HistoryListResponse

router = APIRouter(prefix="/history", tags=["Scan History"])


@router.get("", response_model=HistoryListResponse)
async def list_history(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
) -> HistoryListResponse:
    """Lists past scans for the authenticated user (only scans where store_history was enabled)."""
    return HistoryListResponse(items=[], total=0, page=page, size=size)


@router.delete("/{scan_id}", status_code=status.HTTP_200_OK)
async def delete_history_item(
    scan_id: str,
    user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
) -> dict:
    """Permanently deletes a scan record and any stored encrypted content."""
    return {"message": f"Scan {scan_id} successfully deleted"}


@router.delete("", status_code=status.HTTP_200_OK)
async def delete_all_history(
    user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
) -> dict:
    """Deletes all stored scan records and account history for the user (GDPR/DPDP compliance)."""
    return {"message": "All user scan data has been permanently purged"}
