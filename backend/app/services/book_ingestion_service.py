import uuid
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.base import utc_now_naive
from app.models.book import Book
from app.repositories.book_page_repository import BookPageRepository
from app.repositories.book_repository import BookRepository
from app.services.ebook_parser_service import EbookParserService

settings = get_settings()


class BookIngestionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.book_repo = BookRepository(session)
        self.page_repo = BookPageRepository(session)
        self.parser = EbookParserService()

    async def ingest_book(self, book: Book) -> Book:
        if not book.file_encrypted_path:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Book has no eBook file")

        file_path = self._resolve_ebook_path(book.file_encrypted_path)
        if not file_path.exists():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="eBook file not found on disk")

        try:
            parsed = self.parser.parse(file_path)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse eBook: {exc}",
            ) from exc

        if not parsed.pages:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No readable content found in eBook")

        await self.page_repo.delete_for_book(book.id)
        await self.page_repo.bulk_create(book.id, parsed.pages)

        book.total_pages = len(parsed.pages)
        if parsed.language:
            book.language = parsed.language[:10]

        merged_metadata = dict(book.metadata_extra or {})
        for key, value in parsed.metadata.items():
            if not value:
                continue
            if key not in merged_metadata or not merged_metadata.get(key):
                merged_metadata[key] = value
        merged_metadata["file_format"] = parsed.file_format
        merged_metadata["parsed_page_count"] = len(parsed.pages)
        book.metadata_extra = merged_metadata
        book.updated_at = utc_now_naive()

        return await self.book_repo.update(book)

    async def ensure_pages(self, book: Book) -> Book:
        count = await self.page_repo.count_pages(book.id)
        if count > 0:
            return book
        return await self.ingest_book(book)

    def _resolve_ebook_path(self, relative_path: str) -> Path:
        storage_root = Path(settings.secure_ebooks_path).resolve()
        file_path = (storage_root / relative_path).resolve()
        if not str(file_path).startswith(str(storage_root)):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid file path")
        return file_path
