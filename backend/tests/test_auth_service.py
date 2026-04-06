import pytest
from app.services.auth_service import AuthService
from app.models.store import Store
from app.models.admin import Admin
from app.models.table import Table
from app.utils.password import PasswordHasher
from app.exceptions.auth import InvalidCredentialsException


def test_authenticate_customer_success(test_session):
    """Test successful customer authentication"""
    # Setup
    store = Store(name="Test Store", table_count=5)
    test_session.add(store)
    test_session.flush()

    table = Table(
        store_id=store.id,
        table_number=1,
        password_hash=PasswordHasher.hash_password("1234")
    )
    test_session.add(table)
    test_session.commit()

    # Test
    service = AuthService(test_session)
    result = service.authenticate_customer(table_number=1, password="1234")

    # Assert
    assert result.id == store.id
    assert result.name == "Test Store"


def test_authenticate_customer_invalid_password(test_session):
    """Test customer authentication with invalid password"""
    # Setup
    store = Store(name="Test Store", table_count=5)
    test_session.add(store)
    test_session.flush()

    table = Table(
        store_id=store.id,
        table_number=1,
        password_hash=PasswordHasher.hash_password("1234")
    )
    test_session.add(table)
    test_session.commit()

    # Test
    service = AuthService(test_session)
    with pytest.raises(InvalidCredentialsException):
        service.authenticate_customer(table_number=1, password="wrong")


def test_authenticate_admin_success(test_session):
    """Test successful admin authentication"""
    # Setup
    store = Store(name="Test Store", table_count=5)
    test_session.add(store)
    test_session.flush()

    admin = Admin(
        store_id=store.id,
        username="admin",
        password_hash=PasswordHasher.hash_password("admin123")
    )
    test_session.add(admin)
    test_session.commit()

    # Test
    service = AuthService(test_session)
    result = service.authenticate_admin(username="admin", password="admin123")

    # Assert
    assert result.username == "admin"
    assert result.store_id == store.id
