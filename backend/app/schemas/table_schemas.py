from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TableSessionResponse(BaseModel):
    id: int
    table_id: int
    started_at: datetime
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True


class CompleteSessionRequest(BaseModel):
    table_id: int


class CompleteSessionResponse(BaseModel):
    message: str
    archived_orders_count: int
