import uuid
from datetime import datetime

from sqlalchemy import Column, Enum as SAEnum
from sqlmodel import Field, SQLModel

from app.models.base import jsonb_metadata_field, utc_now_naive
from app.models.enums import SubscriptionStatus


class Subscription(SQLModel, table=True):
    __tablename__ = "subscriptions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    plan_id: str = Field(max_length=100)
    status: SubscriptionStatus = Field(
        default=SubscriptionStatus.EXPIRED,
        sa_column=Column(
            SAEnum(SubscriptionStatus, native_enum=False, values_callable=lambda e: [x.value for x in e])
        ),
    )
    paypal_sub_id: str | None = Field(default=None, max_length=255)
    current_period_end: datetime | None = Field(default=None)
    created_at: datetime = Field(default_factory=utc_now_naive)
    updated_at: datetime = Field(default_factory=utc_now_naive)
    metadata_extra: dict = jsonb_metadata_field()
