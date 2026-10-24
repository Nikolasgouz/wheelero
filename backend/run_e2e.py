"""Launch a migrated local backend for Playwright; no access-log token leakage."""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./e2e.db")

from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
import uvicorn  # noqa: E402

command.upgrade(Config("alembic.ini"), "head")
uvicorn.run("app.main:app", host="127.0.0.1", port=8017, access_log=False)
