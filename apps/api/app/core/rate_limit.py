import time
import collections
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from app.core.config import settings

# Bounded in-memory rate limit store (max 5,000 IPs) with LRU eviction
class BoundedRateLimitDict(collections.OrderedDict):
    def __init__(self, maxsize=5000, *args, **kwargs):
        self.maxsize = maxsize
        super().__init__(*args, **kwargs)

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        if len(self) > self.maxsize:
            self.popitem(last=False)

_in_memory_buckets: Dict[str, Tuple[float, int]] = BoundedRateLimitDict(maxsize=5000)


def extract_client_ip(request: Request) -> str:
    """Extracts the true client IP respecting reverse proxies (Render, Cloudflare, etc.)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # First IP in X-Forwarded-For is the originating client
        return forwarded.split(",")[0].strip()
    cf_connecting = request.headers.get("cf-connecting-ip")
    if cf_connecting:
        return cf_connecting.strip()
    return request.client.host if request.client else "unknown"


async def check_rate_limit(request: Request, limit_per_minute: int = None) -> None:
    """Verifies that the request does not exceed the allowed rate limit."""
    limit = limit_per_minute or settings.RATE_LIMIT_ANONYMOUS_PER_MIN
    client_ip = extract_client_ip(request)
    key = f"rl:{client_ip}"
    now = time.time()

    # In-memory sliding window
    if key in _in_memory_buckets:
        window_start, count = _in_memory_buckets[key]
        if now - window_start < 60:
            if count >= limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit of {limit} requests per minute exceeded. Please retry shortly."
                )
            _in_memory_buckets[key] = (window_start, count + 1)
        else:
            _in_memory_buckets[key] = (now, 1)
    else:
        _in_memory_buckets[key] = (now, 1)
