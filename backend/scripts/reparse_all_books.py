"""Re-ingest all books (use after parser/OCR updates)."""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import async_session_factory
from app.repositories.book_repository import BookRepository
from app.services.book_ingestion_service import BookIngestionService


async def main() -> None:
    async with async_session_factory() as session:
        books = await BookRepository(session).list_all()
        ingestion = BookIngestionService(session)
        for book in books:
            if not book.file_encrypted_path:
                continue
            print(f"Reparsing: {book.title} ...", flush=True)
            book = await ingestion.ingest_book(book)
            print(f"  -> {book.total_pages} pages", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
