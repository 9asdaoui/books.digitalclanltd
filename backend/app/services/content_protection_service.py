import uuid
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.book import Book
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.book_page_repository import BookPageRepository
from app.repositories.book_repository import BookRepository
from app.services.book_ingestion_service import BookIngestionService
from app.services.exceptions import PaymentRequiredError
from app.services.subscription_service import SubscriptionService

settings = get_settings()


class ContentProtectionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.book_repo = BookRepository(session)
        self.page_repo = BookPageRepository(session)
        self.subscription_service = SubscriptionService(session)
        self.ingestion = BookIngestionService(session)

    async def get_protected_page_content(
        self,
        user: User | None,
        book_id: uuid.UUID,
        page_number: int,
    ) -> dict:
        book = await self.book_repo.get_by_id(book_id)
        if book is None:
            raise ValueError("Book not found")

        is_admin = user is not None and user.role == UserRole.ADMIN
        if not book.is_published and not is_admin:
            raise ValueError("Book not found")

        book = await self.ingestion.ensure_pages(book)

        is_subscriber = False
        if user is not None:
            is_subscriber = await self.subscription_service.is_subscriber(user)

        if not is_subscriber and page_number > book.free_page_limit:
            raise PaymentRequiredError(book_id=book.id, free_page_limit=book.free_page_limit)

        content = await self._read_page_content(book, page_number)
        return {
            "book_id": str(book.id),
            "page_number": page_number,
            "content": content,
            "total_pages": book.total_pages,
            "free_page_limit": book.free_page_limit,
        }

    async def _read_page_content(self, book: Book, page_number: int) -> str:
        if page_number < 1 or (book.total_pages > 0 and page_number > book.total_pages):
            raise ValueError("Invalid page number")

        stored = await self.page_repo.get_page_content(book.id, page_number)
        if stored:
            return stored

        if book.file_encrypted_path:
            storage_root = Path(settings.secure_ebooks_path).resolve()
            file_path = (storage_root / book.file_encrypted_path).resolve()
            if str(file_path).startswith(str(storage_root)) and file_path.exists():
                book = await self.ingestion.ingest_book(book)
                stored = await self.page_repo.get_page_content(book.id, page_number)
                if stored:
                    return stored

        return (
            f"[Preview page {page_number} of '{book.title}']\n\n"
            "This book has not been processed yet. Please contact the publisher or re-upload the eBook."
        )

    def resolve_ebook_path(self, relative_path: str) -> Path:
        storage_root = Path(settings.secure_ebooks_path).resolve()
        file_path = (storage_root / relative_path).resolve()
        if not str(file_path).startswith(str(storage_root)):
            raise PermissionError("Path traversal detected")
        return file_path
