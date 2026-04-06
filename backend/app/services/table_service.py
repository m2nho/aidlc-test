from sqlalchemy.orm import Session
from app.models.table_session import TableSession
from app.models.order import Order
from app.models.order_history import OrderHistory
from app.exceptions.business import TableNotFoundException
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)


class TableService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_session(self, table_id: int) -> TableSession:
        """Get active session or create new one"""
        # Find active session
        active_session = self.db.query(TableSession).filter(
            TableSession.table_id == table_id,
            TableSession.ended_at == None
        ).first()

        if active_session:
            return active_session

        # Create new session
        new_session = TableSession(
            table_id=table_id,
            started_at=datetime.utcnow()
        )
        self.db.add(new_session)
        self.db.commit()
        self.db.refresh(new_session)

        logger.info(f"Session created: session_id={new_session.id}, table_id={table_id}")
        return new_session

    def complete_session(self, table_id: int) -> int:
        """Complete session and archive orders"""
        # Find active session
        session = self.db.query(TableSession).filter(
            TableSession.table_id == table_id,
            TableSession.ended_at == None
        ).first()

        if not session:
            raise TableNotFoundException(table_id)

        # Find all orders for this table
        orders = self.db.query(Order).filter(Order.table_id == table_id).all()

        archived_count = 0
        for order in orders:
            # Calculate total amount
            total_amount = sum(item.price * item.quantity for item in order.items)

            # Create order history
            order_history = OrderHistory(
                session_id=session.id,
                order_number=order.order_number,
                status=order.status,
                total_amount=total_amount,
                completed_at=datetime.utcnow(),
                order_data_json=json.dumps({
                    "id": order.id,
                    "items": [
                        {
                            "menu_id": item.menu_id,
                            "quantity": item.quantity,
                            "price": item.price
                        } for item in order.items
                    ]
                })
            )
            self.db.add(order_history)

            # Delete order
            self.db.delete(order)
            archived_count += 1

        # End session
        session.ended_at = datetime.utcnow()
        self.db.commit()

        logger.info(f"Session completed: session_id={session.id}, archived_orders={archived_count}")
        return archived_count

    def get_active_tables(self, store_id: int) -> list:
        """Get active tables with session info"""
        # This would require join with tables - simplified for now
        active_sessions = self.db.query(TableSession).filter(
            TableSession.ended_at == None
        ).all()

        return active_sessions
