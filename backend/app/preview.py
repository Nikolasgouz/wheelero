"""Serve the built frontend and API together for a temporary HTTPS preview."""

from pathlib import Path
from urllib.parse import urlsplit

from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .config import settings
from .main import app

app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=[urlsplit(settings.allowed_origins).hostname]
)
app.mount(
    "/", StaticFiles(directory=Path(__file__).resolve().parents[2] / "frontend/dist", html=True),
    name="preview",
)
