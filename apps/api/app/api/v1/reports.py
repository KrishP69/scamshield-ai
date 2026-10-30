import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status
from app.schemas.report import ShareReportRequest, ShareReportResponse
import collections

router = APIRouter(prefix="/reports", tags=["Reports & Sharing"])

class BoundedDict(collections.OrderedDict):
    def __init__(self, maxsize=1000, *args, **kwargs):
        self.maxsize = maxsize
        super().__init__(*args, **kwargs)

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        if len(self) > self.maxsize:
            self.popitem(last=False)

_shares_db = BoundedDict(maxsize=1000)


@router.post("/{scan_id}/share", response_model=ShareReportResponse)
async def share_report(scan_id: str, payload: ShareReportRequest) -> ShareReportResponse:
    """Generates an expiring public token to share a Trust Passport."""
    share_token = uuid.uuid4().hex[:16]
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=payload.expires_in_hours)).isoformat()

    _shares_db[share_token] = {
        "scan_id": scan_id,
        "expires_at": expires_at,
    }

    return ShareReportResponse(
        share_token=share_token,
        share_url=f"/report/share/{share_token}",
        expires_at=expires_at,
    )


@router.get("/share/{token}")
async def get_shared_report(token: str) -> dict:
    """Retrieves a public shared report by its token, validating expiration."""
    share = _shares_db.get(token)
    if not share:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report share link not found or invalid")

    # Validate token expiration
    try:
        expires_dt = datetime.fromisoformat(share["expires_at"])
        if datetime.now(timezone.utc) > expires_dt:
            _shares_db.pop(token, None)
            raise HTTPException(status_code=status.HTTP_410_GONE, detail="This shared report link has expired")
    except (ValueError, TypeError):
        pass

    return {"scan_id": share["scan_id"], "expires_at": share["expires_at"]}
