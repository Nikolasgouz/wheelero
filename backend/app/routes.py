import hashlib
import secrets
from uuid import UUID

from fastapi import APIRouter, HTTPException, Request, Response
from sqlalchemy import delete, select, update

from .config import settings
from .models import Mutation, Option, Result, Share, Wheel, Workspace, now
from .schemas import DrawRequest, RevisionRequest, WheelWrite
from .security import COOKIE, DB, Owner, token_hash
from .services import check_revision, choose_index, owned_wheel, result_data, wheel_data
from .templates import TEMPLATES

router = APIRouter(prefix="/api")


@router.get("/health", tags=["system"])
def health():
    return {"status": "ok"}


@router.get("/session", tags=["session"])
def session(request: Request, response: Response, db: DB):
    identity = db.get(Workspace, token_hash(request.cookies.get(COOKIE, "")))
    if identity is None:
        token = secrets.token_urlsafe(32)
        identity = Workspace(id=token_hash(token), csrf=secrets.token_urlsafe(32))
        db.add(identity)
        db.flush()
        response.set_cookie(
            COOKIE, token, httponly=True, secure=settings.cookie_secure,
            samesite="lax", max_age=60 * 60 * 24 * 365, path="/api",
        )
    return {"csrf": identity.csrf, "workspace_id": identity.id}


@router.get("/templates", tags=["templates"])
def templates():
    return TEMPLATES


@router.get("/wheels", tags=["wheels"])
def list_wheels(db: DB, owner: Owner):
    return [wheel_data(db, w) for w in db.scalars(
        select(Wheel).where(Wheel.workspace_id == owner.id).order_by(Wheel.updated_at.desc())
    )]


@router.get("/wheels/{wheel_id}", tags=["wheels"])
def get_wheel(wheel_id: UUID, db: DB, owner: Owner):
    return wheel_data(db, owned_wheel(db, str(wheel_id), owner.id))


@router.put("/wheels/{wheel_id}", tags=["wheels"])
def write_wheel(wheel_id: UUID, body: WheelWrite, response: Response, db: DB, owner: Owner):
    """Atomic ordered option replacement and offline-result ingestion, with revision checking."""
    wheel_id = str(wheel_id)
    wheel = db.get(Wheel, wheel_id)
    digest = hashlib.sha256(body.model_dump_json().encode()).hexdigest()
    if wheel is not None:
        wheel = owned_wheel(db, wheel_id, owner.id)
        mutation = db.get(Mutation, (wheel_id, str(body.mutation_id)))
        if mutation:
            if mutation.digest != digest:
                raise HTTPException(409, "This request ID has already been used.")
            return wheel_data(db, wheel)
        check_revision(wheel, body.revision)
        wheel.revision += 1
    else:
        if body.revision != 0:
            raise HTTPException(409, "The original wheel does not exist.")
        wheel = Wheel(id=wheel_id, workspace_id=owner.id, title=body.title, revision=1)
        db.add(wheel)
        db.flush()
        response.status_code = 201
    wheel.title = body.title
    wheel.no_repeat = body.no_repeat
    wheel.customization = body.customization.model_dump()
    wheel.updated_at = now()
    db.execute(delete(Option).where(Option.wheel_id == wheel_id))
    for position, option in enumerate(body.options):
        db.add(Option(
            wheel_id=wheel_id, id=str(option.id), label=option.label,
            active=option.active, position=position, image=option.image,
        ))
    if body.clear_history:
        db.execute(update(Result).where(Result.wheel_id == wheel_id).values(cleared=True))
    for result in body.results:
        existing = db.get(Result, (wheel_id, str(result.id)))
        data = result.model_dump(mode="json")
        if existing:
            if result_data(existing) != data:
                raise HTTPException(409, "This result ID has already been used.")
        else:
            db.add(Result(**data, wheel_id=wheel_id, request_revision=body.revision))
    db.add(Mutation(wheel_id=wheel_id, id=str(body.mutation_id), digest=digest))
    db.flush()
    return wheel_data(db, wheel)


@router.delete("/wheels/{wheel_id}", tags=["wheels"])
def delete_wheel(wheel_id: UUID, body: RevisionRequest, db: DB, owner: Owner):
    wheel = owned_wheel(db, str(wheel_id), owner.id)
    if not wheel.deleted:
        check_revision(wheel, body.revision)
        wheel.deleted = True
        wheel.revision += 1
        wheel.updated_at = now()
        db.execute(delete(Share).where(Share.wheel_id == wheel.id))
        db.flush()
    return wheel_data(db, wheel)


@router.post("/wheels/{wheel_id}/draws", tags=["draws"])
def draw(wheel_id: UUID, body: DrawRequest, db: DB, owner: Owner):
    wheel = owned_wheel(db, str(wheel_id), owner.id)
    existing = db.get(Result, (wheel.id, str(body.id)))
    if existing:
        if existing.source != "server" or existing.request_revision != body.revision:
            raise HTTPException(409, "This draw ID has already been used.")
        return {"wheel": wheel_data(db, wheel), "result": result_data(existing)}
    check_revision(wheel, body.revision)
    options = db.scalars(
        select(Option).where(Option.wheel_id == wheel.id).order_by(Option.position)
    ).all()
    last_in_round = wheel.no_repeat and len(options) == 1 and db.scalar(
        select(Result.id).where(Result.wheel_id == wheel.id, Result.cleared.is_(False)).limit(1)
    ) is not None
    if len(options) < 2 and not last_in_round:
        raise HTTPException(422, "At least two entries are required.")
    active = [o for o in options if o.active or not wheel.no_repeat]
    if not active:
        raise HTTPException(422, "No entries remain. Start a new round.")
    index = choose_index(len(active))
    selected = active[index]
    result = Result(
        wheel_id=wheel.id, id=str(body.id), option_id=selected.id, label=selected.label,
        choice_index=index, choice_count=len(active), source="server",
        request_revision=body.revision,
    )
    db.add(result)
    if wheel.no_repeat:
        selected.active = False
    wheel.revision += 1
    wheel.updated_at = now()
    db.flush()
    return {"wheel": wheel_data(db, wheel), "result": result_data(result)}


@router.get("/wheels/{wheel_id}/history", tags=["draws"])
def history(wheel_id: UUID, db: DB, owner: Owner):
    return wheel_data(db, owned_wheel(db, str(wheel_id), owner.id))["results"]


@router.post("/wheels/{wheel_id}/shares", status_code=201, tags=["sharing"])
def create_share(wheel_id: UUID, body: RevisionRequest, db: DB, owner: Owner):
    wheel = owned_wheel(db, str(wheel_id), owner.id)
    check_revision(wheel, body.revision)
    data = wheel_data(db, wheel)
    share = Share(token=secrets.token_urlsafe(32), wheel_id=wheel.id, snapshot={
        "title": wheel.title, "no_repeat": wheel.no_repeat, "options": data["options"],
        "customization": wheel.customization,
    })
    db.add(share)
    db.flush()
    return {"token": share.token, "created_at": share.created_at}


@router.get("/wheels/{wheel_id}/shares", tags=["sharing"])
def list_shares(wheel_id: UUID, db: DB, owner: Owner):
    wheel = owned_wheel(db, str(wheel_id), owner.id)
    return [{"token": s.token, "created_at": s.created_at} for s in db.scalars(
        select(Share).where(Share.wheel_id == wheel.id)
    )]


@router.delete("/wheels/{wheel_id}/shares/{token}", status_code=204, tags=["sharing"])
def revoke_share(wheel_id: UUID, token: str, db: DB, owner: Owner):
    wheel = owned_wheel(db, str(wheel_id), owner.id)
    db.execute(delete(Share).where(Share.wheel_id == wheel.id, Share.token == token))


@router.get("/shares/{token}", tags=["sharing"])
def public_share(token: str, db: DB):
    share = db.get(Share, token)
    if share is None:
        raise HTTPException(404, "This link does not exist or has been revoked.")
    return share.snapshot
