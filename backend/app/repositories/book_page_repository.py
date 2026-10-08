import uuid

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import utc_now_naive
from app.models.book_page import BookPage


class BookPageRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_page_content(self, book_id: uuid.UUID, page_number: int) -> str | None:
        result = await self.session.execute(
            select(BookPage.content).where(
                BookPage.book_id == book_id,
                BookPage.page_number == page_number,
            )
        )
        return result.scalar_one_or_none()

    async def count_pages(self, book_id: uuid.UUID) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(BookPage).where(BookPage.book_id == book_id)
        )
        return int(result.scalar_one())

    async def delete_for_book(self, book_id: uuid.UUID) -> None:
        await self.session.execute(delete(BookPage).where(BookPage.book_id == book_id))

    async def bulk_create(self, book_id: uuid.UUID, pages: list[str]) -> None:
        now = utc_now_naive()
        for index, content in enumerate(pages, start=1):
            self.session.add(
                BookPage(
                    book_id=book_id,
                    page_number=index,
                    content=content,
                    created_at=now,
                )
            )
        await self.session.flush()
