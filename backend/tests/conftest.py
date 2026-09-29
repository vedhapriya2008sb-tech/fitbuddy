"""Pytest fixtures for FitBuddy AI test suite."""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Force test configuration
os.environ["SECRET_KEY"] = "test-secret-key-32-chars-for-testing"
os.environ["GEMINI_API_KEY"] = ""

from app.database import Base, get_db
from app.main import app

# In-memory SQLite for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create test tables at beginning of test session and clean up after."""
    from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Yield a database session per test function, rolling back changes."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    """FastAPI TestClient with overridden database session dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def user_credentials():
    return {
        "name": "Sarah Connor",
        "email": "sarah@example.com",
        "password": "Password123!",
    }


@pytest.fixture
def second_user_credentials():
    return {
        "name": "John Connor",
        "email": "john@example.com",
        "password": "Password456!",
    }


@pytest.fixture
def auth_headers(client, user_credentials):
    """Register and log in primary test user, returning authorization headers."""
    client.post("/api/auth/register", json=user_credentials)
    resp = client.post(
        "/api/auth/login",
        json={"email": user_credentials["email"], "password": user_credentials["password"]},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def second_auth_headers(client, second_user_credentials):
    """Register and log in second test user, returning authorization headers."""
    client.post("/api/auth/register", json=second_user_credentials)
    resp = client.post(
        "/api/auth/login",
        json={
            "email": second_user_credentials["email"],
            "password": second_user_credentials["password"],
        },
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
