from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.audit_service import AuditService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TokenResponse:
    auth_service = AuthService(session)
    audit = AuditService(session)
    ip = _client_ip(request)

    user = await auth_service.authenticate(body.email, body.password)
    if user is None:
        await audit.log(action="LOGIN_FAILED", ip_address=ip, metadata={"email": body.email})
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    await audit.log(action="LOGIN_SUCCESS", user_id=user.id, ip_address=ip)
    token = await auth_service.create_token(user)
    return TokenResponse(access_token=token)


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    body: RegisterRequest,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TokenResponse:
    auth_service = AuthService(session)
    audit = AuditService(session)
    ip = _client_ip(request)

    user = await auth_service.register(body.email, body.password, body.full_name)
    await audit.log(action="USER_REGISTERED", user_id=user.id, ip_address=ip)
    token = await auth_service.create_token(user)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def me(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> UserResponse:
    data = await AuthService(session).user_to_response(current_user)
    return UserResponse(**data)
