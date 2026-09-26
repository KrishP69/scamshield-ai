import time
from typing import Any, Dict, Optional


class CacheManager:
    """In-memory and Redis-backed cache for threat intelligence lookups."""

    def __init__(self, default_ttl_seconds: int = 3600):
        self._memory_cache: Dict[str, Tuple[float, Any]] = {}
        self.default_ttl = default_ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        if key in self._memory_cache:
            expires_at, val = self._memory_cache[key]
            if time.time() < expires_at:
                return val
            del self._memory_cache[key]
        return None

    def set(self, key: str, val: Any, ttl: Optional[int] = None) -> None:
        expiry = time.time() + (ttl or self.default_ttl)
        self._memory_cache[key] = (expiry, val)


cache = CacheManager()
