"""Wipe all application data from PostgreSQL (keeps schema/migrations)."""
import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text

from app.core.database import engine

TABLES = (
    "book_pages",
    "reading_progress",
    "audit_logs",
    "subscriptions",
    "books",
    "genres",
    "users",
)


async def reset_database() -> None:
    table_list = ", ".join(TABLES)
    async with engine.begin() as conn:
        await conn.execute(text(f"TRUNCATE TABLE {table_list} RESTART IDENTITY CASCADE"))
    print(f"Cleared tables: {', '.join(TABLES)}")


def maybe_clear_storage() -> None:
    if os.getenv("RESET_CLEAR_STORAGE", "").lower() not in {"1", "true", "yes"}:
        return
    from pathlib import Path

    from app.core.config import get_settings

    settings = get_settings()
    covers = Path(settings.public_covers_path)
    ebooks = Path(settings.secure_ebooks_path)
    removed = 0
    for folder in (covers, ebooks):
        if not folder.exists():
            continue
        for path in folder.iterdir():
            if path.is_file():
                path.unlink()
                removed += 1
    print(f"Removed {removed} file(s) from cover/ebook storage.")


async def main() -> None:
    maybe_clear_storage()
    await reset_database()
    print("Database reset complete.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
