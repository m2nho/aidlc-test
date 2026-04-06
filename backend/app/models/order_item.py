from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    menu_id = Column(Integer, ForeignKey("menus.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    menu = relationship("Menu", foreign_keys=[menu_id])
