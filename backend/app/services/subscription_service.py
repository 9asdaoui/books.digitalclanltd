import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import UserRole
from app.models.user import User
from app.repositories.subscription_repository import SubscriptionRepository


class SubscriptionService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = SubscriptionRepository(session)

    async def is_subscriber(self, user: User) -> bool:
        if user.role == UserRole.ADMIN:
            return True
        active = await self.repo.get_active_for_user(user.id)
        return active is not None

    async def is_subscriber_by_id(self, user_id: uuid.UUID) -> bool:
        active = await self.repo.get_active_for_user(user_id)
        return active is not None
