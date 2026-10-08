import uuid
from datetime import datetime

from sqlalchemy import Column, Enum as SAEnum
from sqlmodel import Field, SQLModel

from app.models.base import jsonb_metadata_field, utc_now_naive
from app.models.enums import UserRole


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True, unique=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole = Field(
        default=UserRole.READER,
        sa_column=Column(SAEnum(UserRole, native_enum=False, values_callable=lambda e: [x.value for x in e])),
    )
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utc_now_naive)
    updated_at: datetime = Field(default_factory=utc_now_naive)
    metadata_extra: dict = jsonb_metadata_field()
