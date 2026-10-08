import uuid
from datetime import datetime

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.base import jsonb_metadata_field, utc_now_naive


class ReadingProgress(SQLModel, table=True):
    __tablename__ = "reading_progress"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    book_id: uuid.UUID = Field(foreign_key="books.id", index=True)
    current_page: int = Field(default=1)
    percent_complete: float = Field(default=0.0)
    bookmarks: list = Field(default_factory=list, sa_column=Column(JSONB, nullable=False, server_default="[]"))
    last_read_at: datetime = Field(default_factory=utc_now_naive)
    metadata_extra: dict = jsonb_metadata_field()
