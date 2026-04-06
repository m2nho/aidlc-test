from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.menu import Menu
from app.repositories.order_repository import OrderRepository
from app.utils.order_number import OrderNumberGenerator
from app.utils.sse import sse_manager
from app.exceptions.business import OrderNotFoundException, OrderStatusConflictException
from app.schemas.order_schemas import OrderCreate, OrderItemCreate
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.order_repo = OrderRepository(db)

    async def create_order(self, order_data: OrderCreate, store_id: int) -> Order:
        """Create new order"""
        # Generate order number
        order_number = OrderNumberGenerator.generate(store_id, self.db)

        # Create order
        order = Order(
            store_id=store_id,
            table_id=order_data.table_id,
            order_number=order_number,
            status="pending"
        )
        self.db.add(order)
        self.db.flush()  # Get order ID

        # Create order items
        for item_data in order_data.items:
            menu = self.db.query(Menu).filter(Menu.id == item_data.menu_id).first()
            if menu:
                order_item = OrderItem(
                    order_id=order.id,
                    menu_id=item_data.menu_id,
                    quantity=item_data.quantity,
                    price=menu.price  # Snapshot price
                )
                self.db.add(order_item)

        self.db.commit()
        self.db.refresh(order)

        # Broadcast SSE event
        await sse_manager.broadcast(store_id, {
            "type": "order_created",
            "order": {
                "id": order.id,
                "order_number": order.order_number,
                "table_id": order.table_id,
                "status": order.status
            }
        })

        logger.info(f"Order created: order_id={order.id}, order_number={order.order_number}")
        return order

    async def update_order_status(self, order_id: int, new_status: str) -> Order:
        """Update order status"""
        order = self.order_repo.find_by_id(order_id)
        if not order:
            raise OrderNotFoundException(order_id)

        # Validate status transition
        valid_transitions = {
            "pending": ["preparing"],
            "preparing": ["completed"],
            "completed": []
        }

        if new_status not in valid_transitions.get(order.status, []):
            raise OrderStatusConflictException(order.status, new_status)

        old_status = order.status
        order.status = new_status
        self.order_repo.update(order)

        # Broadcast SSE event
        await sse_manager.broadcast(order.store_id, {
            "type": "order_status_updated",
            "order": {
                "id": order.id,
                "order_number": order.order_number,
                "status": order.status,
                "previous_status": old_status
            }
        })

        logger.info(f"Order status updated: order_id={order_id}, {old_status} -> {new_status}")
        return order

    async def delete_order(self, order_id: int):
        """Delete order"""
        order = self.order_repo.find_by_id(order_id)
        if not order:
            raise OrderNotFoundException(order_id)

        store_id = order.store_id
        self.order_repo.delete(order)

        # Broadcast SSE event
        await sse_manager.broadcast(store_id, {
            "type": "order_deleted",
            "order_id": order_id
        })

        logger.info(f"Order deleted: order_id={order_id}")

    def get_orders(
        self,
        store_id: int,
        status: Optional[str] = None,
        table_id: Optional[int] = None
    ) -> List[Order]:
        """Get orders with filters"""
        return self.order_repo.find_all_by_store(store_id, status, table_id)
