from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.base import Base


class TableSession(Base):
    __tablename__ = "table_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    table_id = Column(Integer, ForeignKey("tables.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at = Column(DateTime, nullable=False, server_default=func.now())
    ended_at = Column(DateTime, nullable=True, index=True)
