import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.base import Base
from app.database.session import get_db
from app.main import app

# Test database URL (in-memory SQLite)
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

# Create test engine
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create test session factory
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def test_db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_session(test_db):
    """Create test database session"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client(test_session):
    """Create test client"""
    def override_get_db():
        try:
            yield test_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
