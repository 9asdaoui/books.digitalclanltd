import uuid
from datetime import datetime

from sqlmodel import Field, SQLModel

from app.models.base import jsonb_metadata_field, utc_now_naive


class Book(SQLModel, table=True):
    __tablename__ = "books"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=500)
    author_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    description: str | None = Field(default=None)
    genre_id: uuid.UUID | None = Field(default=None, foreign_key="genres.id", index=True)
    cover_url: str | None = Field(default=None, max_length=1000)
    file_encrypted_path: str | None = Field(default=None, max_length=1000)
    total_pages: int = Field(default=0)
    free_page_limit: int = Field(default=5)
    is_published: bool = Field(default=False)
    language: str = Field(default="en", max_length=10)
    created_at: datetime = Field(default_factory=utc_now_naive)
    updated_at: datetime = Field(default_factory=utc_now_naive)
    metadata_extra: dict = jsonb_metadata_field()
