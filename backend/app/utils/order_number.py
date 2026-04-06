from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.order import Order


class OrderNumberGenerator:
    @staticmethod
    def generate(store_id: int, db: Session) -> int:
        """Generate next order number for store"""
        max_order_number = db.query(func.max(Order.order_number)).filter(
            Order.store_id == store_id
        ).scalar()

        if max_order_number is None:
            return 1
        return max_order_number + 1
