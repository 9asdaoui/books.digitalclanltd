from pydantic import BaseModel


class SubscriptionStatusResponse(BaseModel):
    is_subscriber: bool
    plan_id: str | None = None
    status: str | None = None
    current_period_end: str | None = None
    paypal_client_id: str | None = None
