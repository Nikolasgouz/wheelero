import secrets

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Option, Result, Wheel


def owned_wheel(db: Session, wheel_id: str, owner_id: str) -> Wheel:
    wheel = db.get(Wheel, wheel_id)
    if wheel is None or wheel.workspace_id != owner_id:
        raise HTTPException(404, "Ο τροχός δεν βρέθηκε.")
    return wheel


def check_revision(wheel: Wheel, revision: int):
    if wheel.deleted or wheel.revision != revision:
        raise HTTPException(409, "Ο τροχός άλλαξε. Απαιτείται συγχρονισμός.")


def result_data(result: Result) -> dict:
    return {
        "id": result.id, "option_id": result.option_id, "label": result.label,
        "choice_index": result.choice_index, "choice_count": result.choice_count,
        "source": result.source, "created_at": result.created_at,
    }


def wheel_data(db: Session, wheel: Wheel) -> dict:
    options = db.scalars(
        select(Option).where(Option.wheel_id == wheel.id).order_by(Option.position)
    ).all()
    results = db.scalars(
        select(Result).where(Result.wheel_id == wheel.id).order_by(Result.created_at.desc())
    ).all()
    return {
        "id": wheel.id, "title": wheel.title, "revision": wheel.revision,
        "no_repeat": wheel.no_repeat, "deleted": wheel.deleted,
        "customization": wheel.customization,
        "updated_at": wheel.updated_at,
        "options": [
            {"id": o.id, "label": o.label, "active": o.active, "image": o.image} for o in options
        ],
        "results": [result_data(r) for r in results],
    }


def choose_index(count: int) -> int:
    return secrets.randbelow(count)
