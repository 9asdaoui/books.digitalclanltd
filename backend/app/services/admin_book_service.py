import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import utc_now_naive
from app.models.book import Book
from app.models.user import User
from app.repositories.book_repository import BookRepository
from app.repositories.genre_repository import GenreRepository
from app.repositories.user_repository import UserRepository
from app.services.book_ingestion_service import BookIngestionService
from app.services.file_storage_service import FileStorageService


def _clean(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _parse_subjects(value: str | None) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(",") if part.strip()]


class AdminBookService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.book_repo = BookRepository(session)
        self.user_repo = UserRepository(session)
        self.genre_repo = GenreRepository(session)
        self.storage = FileStorageService()
        self.ingestion = BookIngestionService(session)

    async def create_book(
        self,
        *,
        admin: User,
        title: str,
        description: str | None,
        genre_id: uuid.UUID,
        free_page_limit: int,
        is_published: bool,
        author_id: uuid.UUID | None,
        author_name: str | None,
        original_publication: str | None,
        series_title: str | None,
        credits: str | None,
        language: str | None,
        loc_class: str | None,
        subjects: str | None,
        category: str | None,
        ebook_no: str | None,
        release_date: str | None,
        copyright_notice: str | None,
        publisher: str | None,
        ebook_file: UploadFile,
        cover_image: UploadFile,
    ) -> Book:
        if not title.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title is required")
        if free_page_limit < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Free page limit cannot be negative")

        genre = await self.genre_repo.get_by_id(genre_id)
        if genre is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Genre not found")

        resolved_author_id = author_id or admin.id
        author = await self.user_repo.get_by_id(resolved_author_id)
        if author is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Author not found")

        cover_url = await self.storage.save_cover(cover_image)
        ebook_relative_path = await self.storage.save_ebook(ebook_file)

        now = utc_now_naive()
        subject_list = _parse_subjects(subjects)
        metadata_extra: dict = {
            "publisher": _clean(publisher) or "Digital Clan Ltd",
            "upload_date": now.isoformat(),
            "category": _clean(category) or "Text",
        }
        if _clean(author_name):
            metadata_extra["author"] = _clean(author_name)
            metadata_extra["author_name"] = _clean(author_name)
        if _clean(original_publication):
            metadata_extra["original_publication"] = _clean(original_publication)
        if _clean(series_title):
            metadata_extra["series_title"] = _clean(series_title)
        if _clean(credits):
            metadata_extra["credits"] = _clean(credits)
        if _clean(loc_class):
            metadata_extra["loc_class"] = _clean(loc_class)
        if subject_list:
            metadata_extra["subjects"] = subject_list
        if _clean(ebook_no):
            metadata_extra["ebook_no"] = _clean(ebook_no)
        if _clean(release_date):
            metadata_extra["release_date"] = _clean(release_date)
        if _clean(copyright_notice):
            metadata_extra["copyright"] = _clean(copyright_notice)

        book = Book(
            title=title.strip(),
            author_id=resolved_author_id,
            description=description.strip() if description else None,
            genre_id=genre_id,
            cover_url=cover_url,
            file_encrypted_path=ebook_relative_path,
            total_pages=0,
            free_page_limit=free_page_limit,
            is_published=is_published,
            language=(_clean(language) or "en")[:10],
            metadata_extra=metadata_extra,
            created_at=now,
            updated_at=now,
        )
        book = await self.book_repo.create(book)
        book = await self.ingestion.ingest_book(book)

        if free_page_limit > book.total_pages:
            book.free_page_limit = book.total_pages
            book = await self.book_repo.update(book)

        return book

    async def reparse_book(self, book_id: uuid.UUID) -> Book:
        book = await self.book_repo.get_by_id(book_id)
        if book is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        return await self.ingestion.ingest_book(book)
