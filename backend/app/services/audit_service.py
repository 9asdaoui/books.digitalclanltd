import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.models.base import utc_now_naive


class AuditService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def log(
        self,
        *,
        action: str,
        user_id: uuid.UUID | None = None,
        ip_address: str | None = None,
        metadata: dict | None = None,
    ) -> None:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            timestamp=utc_now_naive(),
            ip_address=ip_address,
            metadata_extra=metadata or {},
        )
        self.session.add(entry)
        await self.session.commit()
