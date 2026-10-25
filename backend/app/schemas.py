from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from .customization import Customization, Image


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class OptionInput(StrictModel):
    id: UUID
    label: str = Field(min_length=1, max_length=160)
    active: bool = True
    image: Image | None = None

    @field_validator("label")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("The entry cannot be blank.")
        return value


class OfflineResult(StrictModel):
    id: UUID
    option_id: UUID
    label: str = Field(min_length=1, max_length=160)
    choice_index: int = Field(ge=0, lt=10000)
    choice_count: int = Field(ge=1, le=10000)
    source: Literal["offline"]
    created_at: datetime

    @model_validator(mode="after")
    def valid_index(self):
        if self.choice_index >= self.choice_count or self.created_at.tzinfo is None:
            raise ValueError("Invalid index or timestamp without timezone")
        return self


class WheelWrite(StrictModel):
    mutation_id: UUID
    revision: int = Field(ge=0)
    title: str = Field(min_length=1, max_length=120)
    no_repeat: bool = False
    customization: Customization = Field(default_factory=Customization)
    # Drafts with 0 or 1 options can be saved, but cannot be spun.
    options: list[OptionInput] = Field(max_length=10000)
    results: list[OfflineResult] = Field(default_factory=list, max_length=1000)

    @field_validator("title")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("The title cannot be blank.")
        return value

    @model_validator(mode="after")
    def unique_ids(self):
        if len(self.model_dump_json().encode("utf-8")) > 8_000_000:
            raise ValueError("Wheel snapshot exceeds 8 MB")
        for items in (self.options, self.results):
            if len({item.id for item in items}) != len(items):
                raise ValueError("Duplicate client IDs")
        return self


class DrawRequest(StrictModel):
    id: UUID
    revision: int = Field(ge=1)


class RevisionRequest(StrictModel):
    revision: int = Field(ge=1)
