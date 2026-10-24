from datetime import datetime, timezone

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base
from .customization import Customization


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Workspace(Base):
    __tablename__ = "workspaces"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    csrf: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[str] = mapped_column(default=now)


class Wheel(Base):
    __tablename__ = "wheels"
    __table_args__ = (
        CheckConstraint("revision >= 1"),
        CheckConstraint("length(title) BETWEEN 1 AND 120"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"), index=True)
    title: Mapped[str] = mapped_column(String(120))
    revision: Mapped[int] = mapped_column(default=1)
    no_repeat: Mapped[bool] = mapped_column(Boolean, default=False)
    customization: Mapped[dict] = mapped_column(JSON, default=lambda: Customization().model_dump())
    deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[str] = mapped_column(default=now)


class Option(Base):
    __tablename__ = "options"
    __table_args__ = (
        UniqueConstraint("wheel_id", "position"),
        CheckConstraint("position >= 0 AND position < 10000"),
        CheckConstraint("length(label) BETWEEN 1 AND 160"),
    )
    wheel_id: Mapped[str] = mapped_column(ForeignKey("wheels.id"), primary_key=True)
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    label: Mapped[str] = mapped_column(String(160))
    position: Mapped[int]
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    image: Mapped[str | None]


class Result(Base):
    __tablename__ = "results"
    __table_args__ = (
        CheckConstraint("source IN ('server', 'offline')"),
        CheckConstraint("choice_index >= 0 AND choice_index < choice_count"),
        CheckConstraint("choice_count BETWEEN 1 AND 10000"),
        Index("ix_results_wheel_created", "wheel_id", "created_at"),
    )
    wheel_id: Mapped[str] = mapped_column(ForeignKey("wheels.id"), primary_key=True)
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    option_id: Mapped[str] = mapped_column(String(36))
    label: Mapped[str] = mapped_column(String(160))
    choice_index: Mapped[int]
    choice_count: Mapped[int]
    source: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[str] = mapped_column(default=now)
    request_revision: Mapped[int]


class Mutation(Base):
    __tablename__ = "mutations"
    wheel_id: Mapped[str] = mapped_column(ForeignKey("wheels.id"), primary_key=True)
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    digest: Mapped[str] = mapped_column(String(64))


class Share(Base):
    __tablename__ = "shares"
    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    wheel_id: Mapped[str] = mapped_column(ForeignKey("wheels.id"), index=True)
    snapshot: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[str] = mapped_column(default=now)
