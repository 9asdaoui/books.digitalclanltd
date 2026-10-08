from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.genre import Genre


import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.genre import Genre


class GenreRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, genre_id: uuid.UUID) -> Genre | None:
        return await self.session.get(Genre, genre_id)

    async def list_all(self) -> list[Genre]:
        result = await self.session.execute(select(Genre).order_by(Genre.name))
        return list(result.scalars().all())

    async def get_by_slug(self, slug: str) -> Genre | None:
        result = await self.session.execute(select(Genre).where(Genre.slug == slug))
        return result.scalar_one_or_none()

    async def upsert_by_slug(self, genre: Genre) -> Genre:
        existing = await self.get_by_slug(genre.slug)
        if existing:
            existing.name = genre.name
            existing.metadata_extra = genre.metadata_extra
            self.session.add(existing)
            await self.session.commit()
            await self.session.refresh(existing)
            return existing
        self.session.add(genre)
        await self.session.commit()
        await self.session.refresh(genre)
        return genre
