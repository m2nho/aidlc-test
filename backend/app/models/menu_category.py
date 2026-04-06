from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.base import Base


class MenuCategory(Base):
    __tablename__ = "menu_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(50), nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
