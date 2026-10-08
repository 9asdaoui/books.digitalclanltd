from typing import Annotated, Any

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.repositories.subscription_repository import SubscriptionRepository
from app.schemas.subscription import SubscriptionStatusResponse
from app.services.paypal_subscription_service import PayPalSubscriptionService
from app.services.subscription_service import SubscriptionService

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])
settings = get_settings()


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


@router.get("/status", response_model=SubscriptionStatusResponse)
async def subscription_status(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> SubscriptionStatusResponse:
    is_subscriber = await SubscriptionService(session).is_subscriber(current_user)
    active = await SubscriptionRepository(session).get_active_for_user(current_user.id)
    return SubscriptionStatusResponse(
        is_subscriber=is_subscriber,
        plan_id=active.plan_id if active else None,
        status=active.status.value if active else None,
        current_period_end=active.current_period_end.isoformat() if active and active.current_period_end else None,
        paypal_client_id=settings.paypal_client_id or None,
    )


@router.post("/webhooks/paypal")
async def paypal_webhook(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, Any]:
    headers = {k.lower(): v for k, v in request.headers.items()}
    service = PayPalSubscriptionService(session)
    service.verify_webhook_headers(headers)
    payload = await request.json()
    return await service.handle_webhook_event(payload, ip_address=_client_ip(request))
