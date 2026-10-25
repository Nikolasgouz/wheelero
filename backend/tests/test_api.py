from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app


def create(client, payload):
    wheel_id = str(uuid4())
    response = client.put(f"/api/wheels/{wheel_id}", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def test_session_cookie_and_csrf(client, payload):
    response = TestClient(app).get("/api/session")
    cookie = response.headers["set-cookie"]
    assert "HttpOnly" in cookie and "SameSite=lax" in cookie and "Path=/api" in cookie
    client.headers.pop("X-CSRF-Token")
    assert client.put(f"/api/wheels/{uuid4()}", json=payload).status_code == 403


def test_origin_and_cors(client, payload):
    client.headers["Origin"] = "http://127.0.0.1:4173"
    assert client.put(f"/api/wheels/{uuid4()}", json=payload).status_code == 201
    client.headers["Origin"] = "https://evil.example"
    assert client.put(f"/api/wheels/{uuid4()}", json=payload).status_code == 403
    response = client.options("/api/wheels", headers={
        "Origin": "https://evil.example", "Access-Control-Request-Method": "PUT",
    })
    assert response.status_code == 400


def test_ownership_every_private_route(client, payload):
    wheel = create(client, payload)
    path = f"/api/wheels/{wheel['id']}"
    with TestClient(app) as stranger:
        csrf = stranger.get("/api/session").json()["csrf"]
        stranger.headers["X-CSRF-Token"] = csrf
        assert stranger.get("/api/wheels").json() == []
        for suffix in ["", "/history", "/shares"]:
            assert stranger.get(path + suffix).status_code == 404
        assert stranger.put(path, json=payload).status_code == 404
        assert stranger.request("DELETE", path, json={"revision": 1}).status_code == 404
        assert stranger.post(path + "/draws", json={
            "id": str(uuid4()), "revision": 1,
        }).status_code == 404
        assert stranger.post(path + "/shares", json={"revision": 1}).status_code == 404
        assert stranger.delete(path + "/shares/unknown").status_code == 404


@pytest.mark.parametrize("change", [
    {"title": ""}, {"title": " "}, {"title": "a" * 121}, {"revision": -1},
    {"options": [{"id": "bad", "label": "x"}]},
    {"options": [{"id": str(uuid4()), "label": " "}]},
    {"options": [{"id": str(uuid4()), "label": "a" * 161}]},
    {"options": [{"id": str(uuid4()), "label": "x"} for _ in range(10001)]},
    {"unknown": True},
])
def test_validation(client, payload, change):
    payload.update(change)
    response = client.put(f"/api/wheels/{uuid4()}", json=payload)
    assert response.status_code == 422
    assert client.get("/api/wheels").json() == []


def test_duplicate_ids_and_malformed_json(client, payload):
    payload["options"][1]["id"] = payload["options"][0]["id"]
    assert client.put(f"/api/wheels/{uuid4()}", json=payload).status_code == 422
    assert client.put(f"/api/wheels/{uuid4()}", content="{").status_code == 422


def test_update_revision_order_and_persistence(client, payload, db_engine):
    wheel = create(client, payload)
    payload.update(revision=1, mutation_id=str(uuid4()), title="Νέος τίτλος")
    payload["options"].reverse()
    path = f"/api/wheels/{wheel['id']}"
    response = client.put(path, json=payload)
    assert response.status_code == 200
    assert response.json()["options"] == payload["options"]
    assert client.put(path, json=payload).json()["revision"] == 2
    payload["mutation_id"] = str(uuid4())
    assert client.put(path, json=payload).status_code == 409
    # Dispose connections: read back from disk with a fresh application client.
    db_engine.dispose()
    with TestClient(app) as restarted:
        restarted.cookies.update(client.cookies)
        assert restarted.get(path).json()["title"] == "Νέος τίτλος"
    with db_engine.connect() as connection:
        assert connection.execute(text("PRAGMA foreign_keys")).scalar() == 1


def test_draw_and_idempotency(client, payload, monkeypatch):
    wheel = create(client, payload)
    monkeypatch.setattr("app.routes.choose_index", lambda count: count - 1)
    path = f"/api/wheels/{wheel['id']}"
    request = {"id": str(uuid4()), "revision": 1}
    first = client.post(path + "/draws", json=request)
    assert first.status_code == 200
    assert first.json()["result"]["choice_index"] == 2
    assert first.json()["result"]["label"] == payload["options"][2]["label"]
    assert first.json()["result"]["source"] == "server"
    assert client.post(path + "/draws", json=request).json() == first.json()
    assert len(client.get(path + "/history").json()) == 1
    assert client.post(path + "/draws", json={**request, "revision": 2}).status_code == 409


def test_concurrent_retry(client, payload):
    wheel = create(client, payload)
    request = {"id": str(uuid4()), "revision": 1}
    path = f"/api/wheels/{wheel['id']}/draws"
    with ThreadPoolExecutor(max_workers=4) as pool:
        responses = list(pool.map(lambda _: client.post(path, json=request), range(4)))
    assert all(r.status_code == 200 for r in responses)
    assert len({r.json()["result"]["id"] for r in responses}) == 1
    assert len(client.get(f"/api/wheels/{wheel['id']}/history").json()) == 1


def test_no_repeat_exhaustion_and_draft(client, payload):
    payload["no_repeat"] = True
    wheel = create(client, payload)
    seen = set()
    path = f"/api/wheels/{wheel['id']}/draws"
    for revision in range(1, 4):
        response = client.post(path, json={"id": str(uuid4()), "revision": revision})
        assert response.status_code == 200
        seen.add(response.json()["result"]["option_id"])
    assert len(seen) == 3
    assert client.post(path, json={"id": str(uuid4()), "revision": 4}).status_code == 422
    for count in [1, 0]:
        payload["mutation_id"] = str(uuid4())
        payload["options"] = payload["options"][:count]
        draft = create(client, payload)
        result = client.post(f"/api/wheels/{draft['id']}/draws", json={
            "id": str(uuid4()), "revision": 1,
        })
        assert result.status_code == (200 if count else 422)
        if count:
            assert result.json()["result"]["choice_count"] == 1
            assert result.json()["result"]["choice_index"] == 0
            assert client.post(f"/api/wheels/{draft['id']}/draws", json={
                "id": str(uuid4()), "revision": 2,
            }).status_code == 422


def test_sharing_is_snapshot_revocable_and_private(client, payload):
    wheel = create(client, payload)
    path = f"/api/wheels/{wheel['id']}"
    token = client.post(path + "/shares", json={"revision": 1}).json()["token"]
    assert len(token) >= 40
    payload.update(revision=1, mutation_id=str(uuid4()), title="Αλλαγμένο")
    assert client.put(path, json=payload).status_code == 200
    public = TestClient(app).get(f"/api/shares/{token}").json()
    assert public["title"] == wheel["title"]
    assert set(public) == {"title", "options", "no_repeat", "customization"}
    assert client.delete(path + f"/shares/{token}").status_code == 204
    assert TestClient(app).get(f"/api/shares/{token}").status_code == 404


def test_offline_result_retry_and_rollback(client, payload):
    result = {
        "id": str(uuid4()), "option_id": payload["options"][0]["id"], "label": "Πίτσα 🍕",
        "choice_index": 0, "choice_count": 3, "source": "offline",
        "created_at": "2026-10-24T12:00:00Z",
    }
    payload["results"] = [result]
    wheel = create(client, payload)
    path = f"/api/wheels/{wheel['id']}"
    assert len(client.put(path, json=payload).json()["results"]) == 1
    payload.update(revision=1, mutation_id=str(uuid4()))
    assert len(client.put(path, json=payload).json()["results"]) == 1
    payload.update(revision=2, mutation_id=str(uuid4()), title="Should roll back")
    payload["results"][0]["label"] = "Tampered"
    assert client.put(path, json=payload).status_code == 409
    assert client.get(path).json()["title"] != "Should roll back"
    payload["results"][0]["source"] = "server"
    assert client.put(path, json=payload).status_code == 422


def test_delete_tombstone_revokes_shares(client, payload):
    wheel = create(client, payload)
    path = f"/api/wheels/{wheel['id']}"
    token = client.post(path + "/shares", json={"revision": 1}).json()["token"]
    assert client.request("DELETE", path, json={"revision": 1}).json()["deleted"]
    assert client.request("DELETE", path, json={"revision": 1}).status_code == 200
    assert client.get(f"/api/shares/{token}").status_code == 404
    payload.update(revision=2, mutation_id=str(uuid4()))
    assert client.put(path, json=payload).status_code == 409


def test_two_hundred_options(client, payload):
    payload["options"] = [
        {"id": str(uuid4()), "label": f"Επιλογή {i} 🎲", "active": True} for i in range(200)
    ]
    wheel = create(client, payload)
    response = client.post(f"/api/wheels/{wheel['id']}/draws", json={
        "id": str(uuid4()), "revision": 1,
    })
    assert response.status_code == 200
    assert response.json()["result"]["choice_count"] == 200
