from pathlib import Path
from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event

from app import database
from app.main import app


@pytest.fixture
def db_engine(tmp_path, monkeypatch):
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}", connect_args={"check_same_thread": False}
    )
    event.listen(engine, "connect", database.configure_sqlite)
    monkeypatch.setattr(database, "engine", engine)
    config = Config(str(Path(__file__).parents[1] / "alembic.ini"))
    command.upgrade(config, "head")
    yield engine
    engine.dispose()


@pytest.fixture
def client(db_engine):
    with TestClient(app) as client:
        session = client.get("/api/session")
        client.headers["X-CSRF-Token"] = session.json()["csrf"]
        client.headers["Origin"] = "http://localhost:5173"
        yield client


@pytest.fixture
def payload():
    return {
        "mutation_id": str(uuid4()), "revision": 0, "title": "Τι θα φάμε; 🍕",
        "no_repeat": False, "options": [
            {"id": str(uuid4()), "label": label, "active": True}
            for label in ["Πίτσα 🍕", "Σαλάτα 🥗", "Πίτσα 🍕"]
        ], "results": [],
    }
