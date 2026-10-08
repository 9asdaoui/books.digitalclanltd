from datetime import UTC, datetime

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field


def utc_now_naive() -> datetime:
    """UTC timestamp without tzinfo for TIMESTAMP WITHOUT TIME ZONE columns."""
    return datetime.now(UTC).replace(tzinfo=None)


def jsonb_metadata_field():
    return Field(default_factory=dict, sa_column=Column(JSONB, nullable=False, server_default="{}"))
