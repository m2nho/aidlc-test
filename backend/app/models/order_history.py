from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.database.base import Base


class OrderHistory(Base):
    __tablename__ = "order_histories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("table_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    order_number = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False)
    total_amount = Column(Integer, nullable=False)
    completed_at = Column(DateTime, nullable=False)
    order_data_json = Column(Text, nullable=False)
