from pathlib import Path

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_session

router = APIRouter(tags=["health"])
settings = get_settings()


@router.get("/health")
async def health_check() -> dict:
    """Liveness probe — process is running."""
    return {"status": "ok", "service": "digital-clan-books-api", "env": settings.app_env}


@router.get("/ready")
async def readiness_check(session: AsyncSession = Depends(get_session)) -> JSONResponse:
    """Readiness probe — DB and storage paths are available."""
    checks: dict[str, str] = {}

    try:
        await session.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        checks["database"] = f"error: {exc}"

    for label, path_str in (
        ("public_covers", settings.public_covers_path),
        ("secure_ebooks", settings.secure_ebooks_path),
    ):
        path = Path(path_str)
        if path.exists() and path.is_dir():
            checks[label] = "ok"
        else:
            checks[label] = "missing"

    all_ok = all(v == "ok" for v in checks.values())
    payload = {"status": "ok" if all_ok else "degraded", "checks": checks}
    return JSONResponse(status_code=200 if all_ok else 503, content=payload)
