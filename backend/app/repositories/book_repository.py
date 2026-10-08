import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import utc_now_naive
from app.models.book import Book


class BookRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, book_id: uuid.UUID) -> Book | None:
        return await self.session.get(Book, book_id)

    async def list_published(self) -> list[Book]:
        result = await self.session.execute(select(Book).where(Book.is_published.is_(True)))
        return list(result.scalars().all())

    async def list_all(self) -> list[Book]:
        result = await self.session.execute(select(Book).order_by(Book.created_at.desc()))
        return list(result.scalars().all())

    async def create(self, book: Book) -> Book:
        self.session.add(book)
        await self.session.commit()
        await self.session.refresh(book)
        return book

    async def update(self, book: Book) -> Book:
        book.updated_at = utc_now_naive()
        self.session.add(book)
        await self.session.commit()
        await self.session.refresh(book)
        return book
