import os
import socket
import subprocess
import sys
import time
from uuid import uuid4

import httpx


def test_persistence_after_real_process_restart(db_engine, payload):
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    environment = {**os.environ, "DATABASE_URL": str(db_engine.url)}
    wheel_id = str(uuid4())
    cookies = httpx.Cookies()
    for restart in range(2):
        process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--port", str(port),
             "--no-access-log"], env=environment, stdout=subprocess.DEVNULL,
        )
        try:
            # Preserve the session, but never reuse a socket from the terminated server.
            with httpx.Client(base_url=f"http://127.0.0.1:{port}", cookies=cookies) as client:
                for _ in range(100):
                    try:
                        ready = client.get("/api/health")
                        if ready.status_code == 200:
                            break
                    except httpx.ConnectError:
                        time.sleep(0.1)
                else:
                    raise AssertionError("Backend failed to start")
                if restart == 0:
                    csrf = client.get("/api/session").json()["csrf"]
                    response = client.put(
                        f"/api/wheels/{wheel_id}", json=payload,
                        headers={"X-CSRF-Token": csrf},
                    )
                    assert response.status_code == 201
                    cookies.update(client.cookies)
                else:
                    response = client.get(f"/api/wheels/{wheel_id}")
                    assert response.status_code == 200, response.text
                    wheel = response.json()
                    assert wheel["title"] == payload["title"]
                    assert wheel["options"] == payload["options"]
        finally:
            process.terminate()
            process.wait(timeout=10)
