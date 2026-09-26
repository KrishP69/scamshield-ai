import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from app.core.config import settings

# In-memory token bucket fallback for development / offline runs
_in_memory_buckets: Dict[str, Tuple[float, int]] = {}


async def check_rate_limit(request: Request, limit_per_minute: int = None) -> None:
    """Verifies that the request does not exceed the allowed rate limit."""
    limit = limit_per_minute or settings.RATE_LIMIT_ANONYMOUS_PER_MIN
    client_ip = request.client.host if request.client else "unknown"
    key = f"rl:{client_ip}"
    now = time.time()

    # In-memory sliding window fallback
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
