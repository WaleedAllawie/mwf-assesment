import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from db import get_db
from model import Base, User

# Set up file-based SQLite for testing to bypass Postgres dependency
engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_get_users():
    # TestClient without `with` block bypasses lifespan (no pg init_db called)
    response = client.get("/api/users")
    assert response.status_code == 200
    
    # Since it's a fresh in-memory DB, it should return an empty list
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0
