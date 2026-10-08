import logging
import uuid
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.base import utc_now_naive
from app.models.enums import SubscriptionStatus
from app.repositories.subscription_repository import SubscriptionRepository
from app.services.audit_service import AuditService

logger = logging.getLogger(__name__)
settings = get_settings()

PAYPAL_EVENT_MAP = {
    "BILLING.SUBSCRIPTION.ACTIVATED": SubscriptionStatus.ACTIVE,
    "BILLING.SUBSCRIPTION.RE-ACTIVATED": SubscriptionStatus.ACTIVE,
    "BILLING.SUBSCRIPTION.CANCELLED": SubscriptionStatus.EXPIRED,
    "BILLING.SUBSCRIPTION.EXPIRED": SubscriptionStatus.EXPIRED,
    "BILLING.SUBSCRIPTION.SUSPENDED": SubscriptionStatus.EXPIRED,
}


class PayPalSubscriptionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = SubscriptionRepository(session)
        self.audit = AuditService(session)

    def verify_webhook_headers(self, headers: dict[str, str]) -> None:
        if not settings.paypal_webhook_id:
            logger.warning("PAYPAL_WEBHOOK_ID not configured — webhook verification skipped")
            return
        transmission_id = headers.get("paypal-transmission-id") or headers.get("PAYPAL-TRANSMISSION-ID")
        if not transmission_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing PayPal transmission headers")

    async def handle_webhook_event(self, payload: dict, ip_address: str | None = None) -> dict:
        event_type = payload.get("event_type", "")
        resource = payload.get("resource") or {}
        status_enum = PAYPAL_EVENT_MAP.get(event_type)

        if status_enum is None:
            logger.info("Ignoring unhandled PayPal event: %s", event_type)
            return {"handled": False, "event_type": event_type}

        paypal_sub_id = resource.get("id") or resource.get("billing_agreement_id")
        if not paypal_sub_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing subscription id in webhook")

        custom_id = resource.get("custom_id") or (resource.get("subscriber") or {}).get("payer_id")
        user_id: uuid.UUID | None = None
        if custom_id:
            try:
                user_id = uuid.UUID(str(custom_id))
            except ValueError:
                logger.warning("Invalid custom_id in PayPal webhook: %s", custom_id)

        existing = await self.repo.get_by_paypal_id(paypal_sub_id)
        if user_id is None and existing:
            user_id = existing.user_id
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot resolve user for subscription")

        period_end = self._extract_period_end(resource, status_enum)
        plan_id = resource.get("plan_id") or (existing.plan_id if existing else "default_monthly")

        sub = await self.repo.upsert_from_paypal(
            user_id=user_id,
            plan_id=plan_id,
            paypal_sub_id=paypal_sub_id,
            status=status_enum,
            current_period_end=period_end,
            metadata={"last_event": event_type},
        )

        audit_action = "SUB_ACTIVATED" if status_enum == SubscriptionStatus.ACTIVE else "SUB_CANCELLED"
        await self.audit.log(
            action=audit_action,
            user_id=user_id,
            ip_address=ip_address,
            metadata={"paypal_sub_id": paypal_sub_id, "event_type": event_type},
        )
        return {"handled": True, "event_type": event_type, "subscription_id": str(sub.id)}

    def _extract_period_end(self, resource: dict, status: SubscriptionStatus) -> datetime | None:
        if status != SubscriptionStatus.ACTIVE:
            return utc_now_naive()
        billing_info = resource.get("billing_info") or {}
        next_billing = billing_info.get("next_billing_time")
        if next_billing:
            try:
                return datetime.fromisoformat(next_billing.replace("Z", "+00:00")).replace(tzinfo=None)
            except ValueError:
                pass
        return utc_now_naive() + timedelta(days=30)
