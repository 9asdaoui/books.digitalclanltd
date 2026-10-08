import uuid
from datetime import datetime

from sqlalchemy import Column, Text, UniqueConstraint
from sqlmodel import Field, SQLModel

from app.models.base import utc_now_naive


class BookPage(SQLModel, table=True):
    __tablename__ = "book_pages"
    __table_args__ = (UniqueConstraint("book_id", "page_number", name="uq_book_pages_book_page"),)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    book_id: uuid.UUID = Field(foreign_key="books.id", index=True)
    page_number: int = Field(index=True)
    content: str = Field(sa_column=Column(Text, nullable=False))
    created_at: datetime = Field(default_factory=utc_now_naive)
