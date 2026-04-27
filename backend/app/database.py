from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()


def make_engine(url: str):
    if url.startswith("postgresql"):
        return create_engine(url, pool_pre_ping=True)
    return create_engine(url, connect_args={"check_same_thread": False})


def ensure_postgres_db(url: str) -> str:
    """If the target PostgreSQL database does not exist, create it."""
    if not url.startswith("postgresql"):
        return url
    try:
        test_engine = create_engine(url, pool_pre_ping=True)
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return url
    except Exception:
        # Database missing — connect to default 'postgres' and create it
        base_url = url.rsplit("/", 1)[0] + "/postgres"
        temp_engine = create_engine(base_url, pool_pre_ping=True)
        db_name = url.rsplit("/", 1)[-1]
        with temp_engine.connect() as conn:
            conn.execution_options(isolation_level="AUTOCOMMIT")
            conn.execute(text(f"CREATE DATABASE {db_name}"))
        return url


DATABASE_URL = ensure_postgres_db(settings.DATABASE_URL)
engine = make_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
