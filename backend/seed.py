"""Seed initial admin user, genres, and a sample published book."""
import asyncio

from app.core.config import get_settings
from app.core.database import async_session_factory
from app.core.security import get_password_hash
from app.models.book import Book
from app.models.enums import UserRole
from app.models.genre import Genre
from app.models.user import User
from app.repositories.book_repository import BookRepository
from app.repositories.genre_repository import GenreRepository
from app.repositories.user_repository import UserRepository

settings = get_settings()

DEFAULT_GENRES = [
    ("Fiction", "fiction"),
    ("Non-Fiction", "non-fiction"),
    ("Business", "business"),
    ("Technology", "technology"),
]

SAMPLE_BOOK_TITLE = "Digital Clan Starter Guide"


async def seed() -> None:
    async with async_session_factory() as session:
        user_repo = UserRepository(session)
        genre_repo = GenreRepository(session)
        book_repo = BookRepository(session)

        admin_candidate = User(
            email=settings.admin_email,
            hashed_password=get_password_hash(settings.admin_password),
            full_name="System Admin",
            role=UserRole.ADMIN,
            is_active=True,
        )
        admin, created = await user_repo.create_if_not_exists(admin_candidate)
        if created:
            print(f"Admin user created: {admin.email}")
        else:
            print(f"Admin user already exists (password unchanged): {admin.email}")

        genres: list[Genre] = []
        for name, slug in DEFAULT_GENRES:
            genre = await genre_repo.upsert_by_slug(Genre(name=name, slug=slug))
            genres.append(genre)
            print(f"Genre ready: {genre.slug}")

        fiction = next((g for g in genres if g.slug == "fiction"), genres[0])
        existing_books = await book_repo.list_published()
        if not any(b.title == SAMPLE_BOOK_TITLE for b in existing_books):
            sample_book = Book(
                title=SAMPLE_BOOK_TITLE,
                author_id=admin.id,
                description="A sample eBook to verify paywall and API connectivity.",
                genre_id=fiction.id,
                total_pages=20,
                free_page_limit=5,
                is_published=True,
                language="en",
            )
            await book_repo.create(sample_book)
            print(f"Sample book created: {SAMPLE_BOOK_TITLE}")
        else:
            print(f"Sample book already exists: {SAMPLE_BOOK_TITLE}")


if __name__ == "__main__":
    asyncio.run(seed())
