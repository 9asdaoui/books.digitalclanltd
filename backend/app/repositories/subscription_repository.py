import uuid
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import utc_now_naive
from app.models.enums import SubscriptionStatus
from app.models.subscription import Subscription


class SubscriptionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_active_for_user(self, user_id: uuid.UUID) -> Subscription | None:
        now = utc_now_naive()
        result = await self.session.execute(
            select(Subscription).where(
                Subscription.user_id == user_id,
                Subscription.status == SubscriptionStatus.ACTIVE,
                Subscription.current_period_end.is_not(None),
                Subscription.current_period_end > now,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_paypal_id(self, paypal_sub_id: str) -> Subscription | None:
        result = await self.session.execute(
            select(Subscription).where(Subscription.paypal_sub_id == paypal_sub_id)
        )
        return result.scalar_one_or_none()

    async def upsert_from_paypal(
        self,
        *,
        user_id: uuid.UUID,
        plan_id: str,
        paypal_sub_id: str,
        status: SubscriptionStatus,
        current_period_end: datetime | None,
        metadata: dict | None = None,
    ) -> Subscription:
        existing = await self.get_by_paypal_id(paypal_sub_id)
        now = utc_now_naive()
        if existing:
            existing.status = status
            existing.current_period_end = current_period_end
            existing.updated_at = now
            if metadata:
                existing.metadata_extra = {**existing.metadata_extra, **metadata}
            self.session.add(existing)
            await self.session.commit()
            await self.session.refresh(existing)
            return existing

        sub = Subscription(
            user_id=user_id,
            plan_id=plan_id,
            status=status,
            paypal_sub_id=paypal_sub_id,
            current_period_end=current_period_end,
            metadata_extra=metadata or {},
            created_at=now,
            updated_at=now,
        )
        self.session.add(sub)
        await self.session.commit()
        await self.session.refresh(sub)
        return sub

    async def expire_for_user(self, user_id: uuid.UUID) -> None:
        result = await self.session.execute(
            select(Subscription).where(
                Subscription.user_id == user_id,
                Subscription.status == SubscriptionStatus.ACTIVE,
            )
        )
        subs = result.scalars().all()
        now = utc_now_naive()
        for sub in subs:
            sub.status = SubscriptionStatus.EXPIRED
            sub.updated_at = now
            self.session.add(sub)
        if subs:
            await self.session.commit()
