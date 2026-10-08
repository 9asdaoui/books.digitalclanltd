from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.subscription_service import SubscriptionService


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.user_repo = UserRepository(session)
        self.subscription_service = SubscriptionService(session)

    async def authenticate(self, email: str, password: str) -> User | None:
        user = await self.user_repo.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            return None
        return user

    async def register(self, email: str, password: str, full_name: str | None = None) -> User:
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role=UserRole.READER,
            is_active=True,
        )
        return await self.user_repo.create(user)

    async def create_token(self, user: User) -> str:
        return create_access_token(str(user.id))

    async def user_to_response(self, user: User) -> dict:
        is_subscriber = await self.subscription_service.is_subscriber(user)
        return {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "is_subscriber": is_subscriber,
        }
