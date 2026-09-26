import asyncio
import json
from typing import AsyncGenerator, Dict, List


class EventBroadcaster:
    """Manages asynchronous Server-Sent Event (SSE) streams for active scans."""

    def __init__(self):
        self._listeners: Dict[str, List[asyncio.Queue]] = {}

    def subscribe(self, scan_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        if scan_id not in self._listeners:
            self._listeners[scan_id] = []
        self._listeners[scan_id].append(queue)
        return queue

    def unsubscribe(self, scan_id: str, queue: asyncio.Queue) -> None:
        if scan_id in self._listeners:
            if queue in self._listeners[scan_id]:
                self._listeners[scan_id].remove(queue)
            if not self._listeners[scan_id]:
                del self._listeners[scan_id]

    async def emit(self, scan_id: str, event_data: dict) -> None:
        if scan_id in self._listeners:
            for queue in self._listeners[scan_id]:
                await queue.put(event_data)

    async def event_generator(self, scan_id: str) -> AsyncGenerator[str, None]:
        queue = self.subscribe(scan_id)
        try:
            while True:
                data = await queue.get()
                yield f"data: {json.dumps(data)}\n\n"
                if data.get("event") == "complete":
                    break
        finally:
            self.unsubscribe(scan_id, queue)


event_broadcaster = EventBroadcaster()
