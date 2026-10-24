import hashlib
import secrets
from typing import Annotated

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import Workspace

DB = Annotated[Session, Depends(get_db)]
COOKIE = "gyrna_session"


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def workspace(request: Request, db: DB) -> Workspace:
    identity = db.get(Workspace, token_hash(request.cookies.get(COOKIE, "")))
    if identity is None:
        raise HTTPException(401, "Η συνεδρία έληξε. Συνδέσου ξανά.")
    if request.method in {"POST", "PUT", "DELETE"}:
        origin = request.headers.get("origin")
        if origin and origin not in settings.allowed_origins.split(","):
            raise HTTPException(403, "Μη επιτρεπόμενη προέλευση.")
        if not secrets.compare_digest(request.headers.get("x-csrf-token", ""), identity.csrf):
            raise HTTPException(403, "Μη έγκυρο CSRF token.")
    return identity


Owner = Annotated[Workspace, Depends(workspace)]
