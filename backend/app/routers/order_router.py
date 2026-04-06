from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.order_service import OrderService
from app.schemas.order_schemas import OrderCreate, OrderUpdate, OrderResponse
from app.dependencies.auth import get_current_customer, get_current_admin
from typing import List, Optional

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("", response_model=List[OrderResponse])
def get_orders(
    status: Optional[str] = None,
    table_id: Optional[int] = None,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get orders (admin only)"""
    service = OrderService(db)
    orders = service.get_orders(
        store_id=current_user["store_id"],
        status=status,
        table_id=table_id
    )
    return orders


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """Create order (customer only)"""
    service = OrderService(db)
    order = await service.create_order(order_data, current_user["store_id"])
    return order


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: dict = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """Get order by ID"""
    service = OrderService(db)
    orders = service.get_orders(store_id=current_user["store_id"])
    order = next((o for o in orders if o.id == order_id), None)

    if not order:
        from app.exceptions.business import OrderNotFoundException
        raise OrderNotFoundException(order_id)

    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    order_update: OrderUpdate,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update order status (admin only)"""
    service = OrderService(db)
    order = await service.update_order_status(order_id, order_update.status)
    return order


@router.delete("/{order_id}", status_code=204)
async def delete_order(
    order_id: int,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete order (admin only)"""
    service = OrderService(db)
    await service.delete_order(order_id)
