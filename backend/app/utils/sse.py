from typing import Dict
import asyncio
import logging

logger = logging.getLogger(__name__)


class SSEManager:
    def __init__(self):
        # store_id -> list of queues
        self.connections: Dict[int, list] = {}

    def connect(self, store_id: int) -> asyncio.Queue:
        """Create new SSE connection"""
        queue = asyncio.Queue()
        if store_id not in self.connections:
            self.connections[store_id] = []
        self.connections[store_id].append(queue)
        logger.info(f"SSE connection added for store {store_id}")
        return queue

    def disconnect(self, store_id: int, queue: asyncio.Queue):
        """Remove SSE connection"""
        if store_id in self.connections:
            self.connections[store_id].remove(queue)
            if not self.connections[store_id]:
                del self.connections[store_id]
        logger.info(f"SSE connection removed for store {store_id}")

    async def broadcast(self, store_id: int, event: dict):
        """Broadcast event to all connections for a store"""
        if store_id not in self.connections:
            return

        for queue in self.connections[store_id]:
            await queue.put(event)


# Singleton instance
sse_manager = SSEManager()
