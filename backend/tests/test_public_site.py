from uuid import uuid4
from pathlib import Path
import sqlite3
import subprocess
import sys

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import select

from app.customization import Customization
from app.config import Settings, settings
from app.main import app
from app.models import Share, Wheel
from sqlalchemy.orm import Session


def test_standalone_snapshot_has_no_private_wheel_or_history(client, payload, db_engine):
    snapshot = {
        "request_id": str(uuid4()), "client_wheel_id": str(uuid4()),
        "title": "Shared names", "options": payload["options"],
        "customization": Customization().model_dump(),
    }
    response = client.post("/api/shares", json=snapshot)
    assert response.status_code == 201, response.text
    token = response.json()["token"]
    assert client.post("/api/shares", json=snapshot).json()["token"] == token
    with Session(db_engine) as db:
        assert db.scalar(select(Wheel)) is None
        assert len(list(db.scalars(select(Share)))) == 1
    public = TestClient(app).get(f"/api/shares/{token}").json()
    assert "results" not in public and "workspace_id" not in public
    assert public["options"] == payload["options"]
    assert client.post("/api/shares", json=snapshot | {"title": "Changed"}).status_code == 409
    assert client.post("/api/shares", json=snapshot | {"results": []}).status_code == 422
    stranger = TestClient(app)
    stranger.headers["X-CSRF-Token"] = stranger.get("/api/session").json()["csrf"]
    assert stranger.delete(f"/api/shares/{token}").status_code == 404
    assert client.delete(f"/api/shares/{token}").status_code == 204
    assert client.get(f"/api/shares/{token}").status_code == 404


def test_delete_server_data_is_owner_scoped(client, payload):
    wheel_id = str(uuid4())
    assert client.put(f"/api/wheels/{wheel_id}", json=payload).status_code == 201
    other = TestClient(app)
    other.headers["X-CSRF-Token"] = other.get("/api/session").json()["csrf"]
    other_id = str(uuid4())
    other.put(f"/api/wheels/{other_id}", json=payload)
    assert client.delete("/api/session/data").status_code == 204
    assert client.get("/api/wheels").json() == []
    assert other.get(f"/api/wheels/{other_id}").status_code == 200


def test_production_configuration_and_public_metadata(monkeypatch):
    production = dict(
        deployment_mode="production", public_url="https://wheel.example",
        allowed_origins="https://wheel.example", cookie_secure=True,
        database_url="sqlite:////data/wheelero.db", public_indexing=True,
    )
    assert Settings(_env_file=None, **production).public_url == "https://wheel.example"
    for invalid in [
        {"cookie_secure": False}, {"database_url": "sqlite:///temporary.db"},
        {"allowed_origins": "*"}, {"public_url": "https://wheel.example?token=secret"},
    ]:
        with pytest.raises(ValidationError):
            Settings(_env_file=None, **(production | invalid))
    monkeypatch.setattr(settings, "public_url", production["public_url"])
    monkeypatch.setattr(settings, "public_indexing", True)
    client = TestClient(app)
    assert "Allow: /" in client.get("/robots.txt").text
    sitemap = client.get("/sitemap.xml").text
    assert sitemap.count("<url>") == 7
    assert "https://wheel.example/privacy" in sitemap
    assert "localhost" not in sitemap
    assert "__PUBLIC_ORIGIN__" not in client.get("/").text
    assert "noindex,nofollow" in client.get("/?share=example").text
    assert client.get("/api/missing").status_code == 404
    monkeypatch.setattr(settings, "deployment_mode", "production")
    assert client.get("/api/launch").status_code == 404


def test_sqlite_backup_restore_retains_data_and_refuses_overwrite(tmp_path):
    source = tmp_path / "source.db"
    with sqlite3.connect(source) as db:
        db.execute("CREATE TABLE entries (label TEXT)")
        db.execute("INSERT INTO entries VALUES (?)", ("Alex 🎉",))
    script = Path(__file__).resolve().parents[2] / "scripts" / "database.py"
    backup, restored = tmp_path / "backup.db", tmp_path / "restored.db"
    subprocess.run([sys.executable, script, "backup", source, backup], check=True)
    subprocess.run([sys.executable, script, "restore", backup, restored], check=True)
    with sqlite3.connect(restored) as db:
        assert db.execute("SELECT label FROM entries").fetchone() == ("Alex 🎉",)
        assert db.execute("PRAGMA integrity_check").fetchone() == ("ok",)
    retry = subprocess.run(
        [sys.executable, script, "restore", backup, restored], capture_output=True,
    )
    assert retry.returncode != 0
