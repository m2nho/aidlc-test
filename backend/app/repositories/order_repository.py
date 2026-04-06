from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.order_item import OrderItem
from typing import List, Optional


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, order_id: int) -> Optional[Order]:
        """Find order by ID"""
        return self.db.query(Order).filter(Order.id == order_id).first()

    def find_all_by_store(self, store_id: int, status: Optional[str] = None, table_id: Optional[int] = None) -> List[Order]:
        """Find all orders by store with optional filters"""
        query = self.db.query(Order).filter(Order.store_id == store_id)

        if status:
            query = query.filter(Order.status == status)

        if table_id:
            query = query.filter(Order.table_id == table_id)

        return query.order_by(Order.created_at.desc()).all()

    def create(self, order: Order) -> Order:
        """Create order"""
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update(self, order: Order) -> Order:
        """Update order"""
        self.db.commit()
        self.db.refresh(order)
        return order

    def delete(self, order: Order):
        """Delete order"""
        self.db.delete(order)
        self.db.commit()
