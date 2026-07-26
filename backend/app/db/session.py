from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# pool_pre_ping=True → pings DB before each query
# Important for Neon serverless — wakes the DB if it auto-suspended
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)

# Session factory — each request gets its own session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    FastAPI dependency that provides a DB session per request.
    Opens a session → yields it to the route → closes it after.
    Used as: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
