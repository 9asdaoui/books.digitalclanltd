import uuid
from datetime import datetime

from sqlmodel import Field, SQLModel

from app.models.base import jsonb_metadata_field, utc_now_naive


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID | None = Field(default=None, foreign_key="users.id", index=True)
    action: str = Field(max_length=100, index=True)
    timestamp: datetime = Field(default_factory=utc_now_naive, index=True)
    ip_address: str | None = Field(default=None, max_length=45)
    metadata_extra: dict = jsonb_metadata_field()
