from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MenuCreate(BaseModel):
    name: str
    price: int
    description: Optional[str] = None
    category_id: int
    is_available: bool = True


class MenuUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None
    description: Optional[str] = None
    is_available: Optional[bool] = None


class MenuResponse(BaseModel):
    id: int
    store_id: int
    category_id: int
    name: str
    description: Optional[str]
    price: int
    is_available: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
