from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# psycopg3 requires 'postgresql+psycopg://' prefix
# Handle standard URLs from cloud providers like Render, Heroku, Neon, Supabase
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

# pool_pre_ping=True → pings DB before each query
# Important for Neon serverless — wakes the DB if it auto-suspended
engine = create_engine(
    db_url,
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
