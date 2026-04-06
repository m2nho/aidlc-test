from sqlalchemy.orm import Session
from app.models.store import Store
from app.models.admin import Admin
from app.repositories.store_repository import StoreRepository
from app.utils.password import PasswordHasher
from app.exceptions.auth import InvalidCredentialsException
from typing import Optional


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.store_repo = StoreRepository(db)

    def authenticate_customer(self, table_number: int, password: str) -> Store:
        """Authenticate customer by table number and password"""
        store = self.store_repo.find_by_table_password(table_number, password)

        if not store:
            raise InvalidCredentialsException()

        return store

    def authenticate_admin(self, username: str, password: str) -> Admin:
        """Authenticate admin by username and password"""
        admin = self.db.query(Admin).filter(Admin.username == username).first()

        if not admin:
            raise InvalidCredentialsException()

        if not PasswordHasher.verify_password(password, admin.password_hash):
            raise InvalidCredentialsException()

        return admin
