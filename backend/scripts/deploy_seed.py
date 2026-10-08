"""Seed deployment data: 1 admin, 1 reader, genres, and 2 published books."""
import asyncio
import os
import shutil
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.config import get_settings
from app.core.database import async_session_factory
from app.core.security import get_password_hash
from app.models.base import utc_now_naive
from app.models.book import Book
from app.models.enums import UserRole
from app.models.genre import Genre
from app.models.user import User
from app.repositories.book_repository import BookRepository
from app.repositories.genre_repository import GenreRepository
from app.repositories.user_repository import UserRepository
from app.services.book_ingestion_service import BookIngestionService

settings = get_settings()

SEED_DATA_DIR = Path(os.getenv("SEED_DATA_DIR", "/app/seed_data"))

DEFAULT_GENRES = [
    ("Fiction", "fiction"),
    ("Non-Fiction", "non-fiction"),
    ("Business", "business"),
    ("Technology", "technology"),
]

READER_EMAIL = os.getenv("READER_EMAIL", "reader@digitalclan.com")
READER_PASSWORD = os.getenv("READER_PASSWORD", "Reader123!")
READER_NAME = os.getenv("READER_NAME", "Demo Reader")

BOOKS = [
    {
        "title": "Silver .41",
        "description": "A classic Western adventure from the golden age of pulp fiction.",
        "genre_slug": "fiction",
        "free_page_limit": 5,
        "language": "en",
        "ebook_file": "book1.epub",
        "cover_file": "bookcover1.jpg",
        "metadata_extra": {
            "author": "Tuttle, W. C. (Wilbur C.), 1883-1969",
            "author_name": "Tuttle, W. C. (Wilbur C.), 1883-1969",
            "original_publication": "New York, NY: The Ridgway Company, 1925.",
            "series_title": "Produced from Adventure Magazine, November 30, 1925.",
            "credits": "Prepared by volunteers at BookCove (bookcove.net)",
            "language": "English",
            "loc_class": "PS: Language and Literatures: American and Canadian literature",
            "subjects": [
                "Western stories",
                "Detective and mystery stories",
                "Murder -- Investigation -- Fiction",
                "Sheriffs -- Fiction",
                "Counterfeiters -- Fiction",
            ],
            "category": "Text",
            "ebook_no": "78893",
            "release_date": "Jun 18, 2026",
            "copyright": "Public domain in the USA.",
            "publisher": "Digital Clan Ltd",
        },
    },
    {
        "title": "Surrounded by Idiots",
        "description": (
            "A runaway bestseller that uses a simple color-coded system to explain "
            "how people think, communicate, and behave."
        ),
        "genre_slug": "business",
        "free_page_limit": 8,
        "language": "en",
        "ebook_file": "Yourbookshelf-1386-Surrounded-by-Idiots.pdf",
        "cover_file": "7242426YB-Surrounded-by-Idiots.jpg.webp",
        "metadata_extra": {
            "author": "Thomas Erikson",
            "author_name": "Thomas Erikson",
            "original_publication": "Stockholm, Sweden: HOI Publishing, 2014.",
            "series_title": "The Four Types of Human Behavior",
            "credits": "Digital Clan Books catalog",
            "language": "English",
            "loc_class": "BF: Psychology",
            "subjects": [
                "Personality psychology",
                "Communication -- Psychological aspects",
                "Interpersonal relations",
                "Self-help",
            ],
            "category": "Text",
            "ebook_no": "1386",
            "release_date": "Jun 18, 2026",
            "copyright": "All rights reserved to the original publisher.",
            "publisher": "Yourbookshelf / Digital Clan Ltd",
        },
    },
]


def copy_cover(src: Path) -> str:
    ext = src.suffix.lower()
    if ext == ".jpeg":
        ext = ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    dest_dir = Path(settings.public_covers_path)
    dest_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest_dir / filename)
    return f"{settings.public_covers_url_prefix}/{filename}"


def copy_ebook(src: Path) -> str:
    filename = f"{uuid.uuid4()}{src.suffix.lower()}"
    dest_dir = Path(settings.secure_ebooks_path)
    dest_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest_dir / filename)
    return filename


async def seed() -> None:
    if not SEED_DATA_DIR.exists():
        raise FileNotFoundError(f"Seed data directory not found: {SEED_DATA_DIR}")

    now = utc_now_naive()
    async with async_session_factory() as session:
        user_repo = UserRepository(session)
        genre_repo = GenreRepository(session)
        book_repo = BookRepository(session)
        ingestion = BookIngestionService(session)

        admin = await user_repo.create(
            User(
                email=settings.admin_email,
                hashed_password=get_password_hash(settings.admin_password),
                full_name="System Admin",
                role=UserRole.ADMIN,
                is_active=True,
                created_at=now,
                updated_at=now,
            )
        )
        print(f"Admin created: {admin.email}")

        reader = await user_repo.create(
            User(
                email=READER_EMAIL,
                hashed_password=get_password_hash(READER_PASSWORD),
                full_name=READER_NAME,
                role=UserRole.READER,
                is_active=True,
                created_at=now,
                updated_at=now,
            )
        )
        print(f"Reader created: {reader.email}")

        genres: dict[str, Genre] = {}
        for name, slug in DEFAULT_GENRES:
            genre = await genre_repo.upsert_by_slug(Genre(name=name, slug=slug))
            genres[slug] = genre
            print(f"Genre ready: {genre.slug}")

        for spec in BOOKS:
            ebook_src = SEED_DATA_DIR / spec["ebook_file"]
            cover_src = SEED_DATA_DIR / spec["cover_file"]
            if not ebook_src.exists():
                raise FileNotFoundError(f"Missing eBook file: {ebook_src}")
            if not cover_src.exists():
                raise FileNotFoundError(f"Missing cover file: {cover_src}")

            genre = genres[spec["genre_slug"]]
            cover_url = copy_cover(cover_src)
            ebook_path = copy_ebook(ebook_src)

            book = await book_repo.create(
                Book(
                    title=spec["title"],
                    author_id=admin.id,
                    description=spec["description"],
                    genre_id=genre.id,
                    cover_url=cover_url,
                    file_encrypted_path=ebook_path,
                    total_pages=0,
                    free_page_limit=spec["free_page_limit"],
                    is_published=True,
                    language=spec["language"],
                    metadata_extra={
                        **spec["metadata_extra"],
                        "upload_date": now.isoformat(),
                    },
                    created_at=now,
                    updated_at=now,
                )
            )
            book = await ingestion.ingest_book(book)
            print(f"Book seeded: {book.title} ({book.total_pages} pages)")

    print("\n--- Deployment seed complete ---")
    print(f"Admin : {settings.admin_email} / {settings.admin_password}")
    print(f"Reader: {READER_EMAIL} / {READER_PASSWORD}")


async def main() -> None:
    await seed()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
