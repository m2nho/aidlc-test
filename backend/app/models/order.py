from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    table_id = Column(Integer, ForeignKey("tables.id", ondelete="CASCADE"), nullable=False, index=True)
    order_number = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="pending", index=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint('store_id', 'order_number', name='uq_store_order_number'),
    )

    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    table = relationship("Table", foreign_keys=[table_id])
