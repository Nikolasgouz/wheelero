from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, Session
from fastapi import Request

from .config import settings


class Base(DeclarativeBase):
    pass


engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})


@event.listens_for(engine, "connect")
def configure_sqlite(connection, _):
    connection.execute("PRAGMA foreign_keys=ON")
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("PRAGMA busy_timeout=10000")


def get_db(request: Request):
    with Session(engine) as db:
        # Serialize read-modify-write operations, including idempotency lookups.
        if request.method in {"POST", "PUT", "DELETE"}:
            db.execute(text("BEGIN IMMEDIATE"))
        yield db
        db.commit()
