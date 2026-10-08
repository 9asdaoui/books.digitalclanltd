import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import decode_access_token
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository

security_scheme = HTTPBearer(auto_error=False)


def _parse_token_subject(sub: str) -> uuid.UUID:
    try:
        return uuid.UUID(sub)
    except (ValueError, AttributeError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


async def get_current_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security_scheme)],
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_access_token(credentials.credentials)
    if payload is None or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = _parse_token_subject(str(payload["sub"]))
    user = await UserRepository(session).get_by_id(user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


async def get_admin_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


async def get_optional_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security_scheme)],
) -> User | None:
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None or "sub" not in payload:
        return None
    try:
        user_id = _parse_token_subject(str(payload["sub"]))
    except HTTPException:
        return None
    return await UserRepository(session).get_by_id(user_id)
