import os
import logging
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import sessionmaker
from model import Base, User

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./assessment.db"
)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # Postgres Connection pooling settings
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=1800,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """
    Initialize database, create tables, and idempotent seed.
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Idempotent seed
    with SessionLocal() as db:
        try:
            # Check if any users exist
            user_count = db.scalar(select(func.count()).select_from(User))
            
            if user_count == 0:
                logger.info("Database empty, seeding mock users...")
                mock_users = [
                    User(name=f"Mock User {i}", email=f"user{i}@example.com")
                    for i in range(1, 16)
                ]
                db.add_all(mock_users)
                db.commit()
                logger.info("Database successfully seeded with 15 users.")
            else:
                logger.info(f"Database already contains {user_count} users. Skipping seed.")
        except Exception as e:
            logger.error(f"Error during database initialization: {e}")
            db.rollback()

def get_db():
    """
    Dependency to get a database session for a request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
