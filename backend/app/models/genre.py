import uuid

from sqlmodel import Field, SQLModel

from app.models.base import jsonb_metadata_field


class Genre(SQLModel, table=True):
    __tablename__ = "genres"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=100)
    slug: str = Field(index=True, unique=True, max_length=100)
    metadata_extra: dict = jsonb_metadata_field()
