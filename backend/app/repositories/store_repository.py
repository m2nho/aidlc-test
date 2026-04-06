from sqlalchemy.orm import Session
from app.models.store import Store
from app.models.table import Table
from app.utils.password import PasswordHasher
from typing import Optional


class StoreRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_by_table_password(self, table_number: int, password: str) -> Optional[Store]:
        """Find store by table number and password"""
        # Find table by table_number
        tables = self.db.query(Table).filter(Table.table_number == table_number).all()

        # Try to match password
        for table in tables:
            if PasswordHasher.verify_password(password, table.password_hash):
                # Return store
                return self.db.query(Store).filter(Store.id == table.store_id).first()

        return None
