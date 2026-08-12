import logging
import uuid
from datetime import datetime
from typing import List
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from db import init_db, get_db
from model import User

# 1. Setup structured, timestamped logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# 2. FastAPI Lifespan to initialize DB
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application starting up... Initializing database...")
    init_db()
    yield
    logger.info("Application shutting down...")

app = FastAPI(lifespan=lifespan, title="Assessment API")

# 3. Configure CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    # Allow local Vite dev server and Nginx prod build ports
    allow_origins=["http://localhost:5173", "http://localhost"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Global exception handler for DB exceptions
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Global Database Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal database error occurred."},
    )

# 5. Pydantic UserResponse model (DTO)
class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    created_at: datetime
    updated_at: datetime

    # Required to correctly parse SQLAlchemy objects
    model_config = ConfigDict(from_attributes=True)

# 6. GET /api/users Endpoint (Clean Architecture)
@app.get("/api/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100, description="Max records to return to prevent massive table scans"),
    offset: int = Query(0, ge=0, description="Pagination offset")
):
    logger.info(f"API Request: Fetching users (limit={limit}, offset={offset})")
    users = db.scalars(select(User).offset(offset).limit(limit)).all()
    return users
