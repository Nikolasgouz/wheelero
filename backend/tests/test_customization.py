from copy import deepcopy
from pathlib import Path
from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.customization import Customization
from app.main import app


@pytest.mark.parametrize("patch", [
    {"version": 2}, {"duration": 0}, {"duration": 61}, {"max_names": 3},
    {"max_names": 1001}, {"spin_volume": -1}, {"result_volume": 101},
    {"mode": "unknown"}, {"text": "unknown"}, {"center_size": "unknown"},
    {"palette": [{"color": "#ffffff", "enabled": False}]},
    {"palette": [{"color": "red", "enabled": True}]},
    {"wheel_image": "https://private.example/image.png"},
    {"center_image": "data:image/svg+xml;base64,PHN2Zz4="},
    {"center_image": "data:image/png;base64,bm90LWFuLWltYWdl"},
])
def test_invalid_customization(client, payload, patch):
    payload["customization"] = Customization().model_dump() | patch
    response = client.put(f"/api/wheels/{uuid4()}", json=payload)
    assert response.status_code == 422


def test_settings_images_sharing_and_draw_integrity(client, payload, monkeypatch):
    image = "/images/aurora.webp"
    payload["options"][2]["image"] = image
    payload["customization"] = Customization(
        duration=60, max_names=4, show_duplicates=False, center_image=image,
        mode="image", wheel_image="/images/sunset.webp", auto_remove=True,
    ).model_dump()
    path = f"/api/wheels/{uuid4()}"
    created = client.put(path, json=payload)
    assert created.status_code == 201
    assert client.get(path).json()["customization"] == payload["customization"]
    assert client.get(path).json()["options"] == payload["options"]
    assert client.put(path, json=payload).json()["revision"] == 1
    stranger = TestClient(app)
    stranger.get("/api/session")
    assert stranger.get(path).status_code == 404
    counts = []
    monkeypatch.setattr("app.routes.choose_index", lambda count: counts.append(count) or 2)
    request = {"id": str(uuid4()), "revision": 1}
    result = client.post(path + "/draws", json=request).json()
    assert counts == [3]
    assert result["result"]["option_id"] == payload["options"][2]["id"]
    assert client.post(path + "/draws", json=request).json()["result"] == result["result"]
    token = client.post(path + "/shares", json={"revision": 2}).json()["token"]
    snapshot = stranger.get(f"/api/shares/{token}").json()
    assert snapshot["customization"] == payload["customization"]
    assert snapshot["options"][2]["image"] == image
    changed = deepcopy(payload)
    changed.update(revision=2, mutation_id=str(uuid4()))
    changed["customization"]["duration"] = 1
    assert client.put(path, json=changed).status_code == 200
    assert stranger.get(f"/api/shares/{token}").json() == snapshot
    assert client.delete(path + f"/shares/{token}").status_code == 204
    assert stranger.get(f"/api/shares/{token}").status_code == 404


def test_old_database_upgrade_preserves_private_and_shared_data(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    monkeypatch.setattr("app.database.engine", engine)
    config = Config(str(Path(__file__).parents[1] / "alembic.ini"))
    command.upgrade(config, "5da8562261f3")
    with engine.begin() as connection:
        connection.execute(text("INSERT INTO workspaces VALUES ('owner','csrf','today')"))
        connection.execute(text(
            "INSERT INTO wheels VALUES ('wheel','owner','Legacy',1,0,0,'today')"
        ))
        connection.execute(text("INSERT INTO options VALUES ('wheel','entry','Name',0,1)"))
        connection.execute(text(
            "INSERT INTO shares VALUES ('token','wheel',:snapshot,'today')"
        ), {"snapshot": '{"title":"Legacy","no_repeat":false,"options":[]}'})
    command.upgrade(config, "head")
    with engine.connect() as connection:
        row = connection.execute(text("SELECT title, customization FROM wheels")).one()
        assert row.title == "Legacy"
        assert Customization.model_validate_json(row.customization).duration == 10
        assert connection.execute(text("SELECT label, image FROM options")).one() == ("Name", None)
        assert '"customization"' in connection.scalar(text("SELECT snapshot FROM shares"))
    engine.dispose()
