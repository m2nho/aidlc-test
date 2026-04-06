from fastapi import APIRouter, Depends
from starlette.responses import StreamingResponse
from app.dependencies.auth import get_current_admin
from app.utils.sse import sse_manager
import asyncio
import json

router = APIRouter(prefix="/api/sse", tags=["SSE"])


@router.get("/orders")
async def sse_orders(
    current_user: dict = Depends(get_current_admin)
):
    """SSE stream for real-time order updates (admin only)"""
    store_id = current_user["store_id"]
    queue = sse_manager.connect(store_id)

    async def event_generator():
        try:
            while True:
                # Wait for event with timeout (30s heartbeat)
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # Send heartbeat
                    yield f": heartbeat\n\n"
        except asyncio.CancelledError:
            # Connection closed
            sse_manager.disconnect(store_id, queue)
        finally:
            sse_manager.disconnect(store_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
