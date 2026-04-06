from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class OrderItemCreate(BaseModel):
    menu_id: int
    quantity: int


class OrderCreate(BaseModel):
    table_id: int
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: str


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    menu_id: int
    quantity: int
    price: int

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    store_id: int
    table_id: int
    order_number: int
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
