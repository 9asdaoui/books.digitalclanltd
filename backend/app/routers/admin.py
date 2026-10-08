import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.deps import get_admin_user
from app.models.user import User
from app.schemas.admin import AdminBookCreateResponse
from app.services.admin_book_service import AdminBookService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/admin", tags=["admin"])


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


def _book_response(book) -> AdminBookCreateResponse:
    return AdminBookCreateResponse(
        id=str(book.id),
        title=book.title,
        author_id=str(book.author_id),
        genre_id=str(book.genre_id) if book.genre_id else None,
        cover_url=book.cover_url,
        file_encrypted_path=book.file_encrypted_path,
        total_pages=book.total_pages,
        free_page_limit=book.free_page_limit,
        is_published=book.is_published,
        metadata_extra=book.metadata_extra or {},
    )


@router.post("/books", response_model=AdminBookCreateResponse, status_code=201)
async def create_book(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    admin: Annotated[User, Depends(get_admin_user)],
    title: Annotated[str, Form()],
    genre_id: Annotated[uuid.UUID, Form()],
    free_page_limit: Annotated[int, Form()],
    ebook_file: Annotated[UploadFile, File()],
    cover_image: Annotated[UploadFile, File()],
    description: Annotated[str | None, Form()] = None,
    is_published: Annotated[bool, Form()] = False,
    author_id: Annotated[uuid.UUID | None, Form()] = None,
    author_name: Annotated[str | None, Form()] = None,
    original_publication: Annotated[str | None, Form()] = None,
    series_title: Annotated[str | None, Form()] = None,
    credits: Annotated[str | None, Form()] = None,
    language: Annotated[str | None, Form()] = None,
    loc_class: Annotated[str | None, Form()] = None,
    subjects: Annotated[str | None, Form()] = None,
    category: Annotated[str | None, Form()] = None,
    ebook_no: Annotated[str | None, Form()] = None,
    release_date: Annotated[str | None, Form()] = None,
    copyright_notice: Annotated[str | None, Form()] = None,
    publisher: Annotated[str | None, Form()] = None,
) -> AdminBookCreateResponse:
    service = AdminBookService(session)
    book = await service.create_book(
        admin=admin,
        title=title,
        description=description,
        genre_id=genre_id,
        free_page_limit=free_page_limit,
        is_published=is_published,
        author_id=author_id,
        author_name=author_name,
        original_publication=original_publication,
        series_title=series_title,
        credits=credits,
        language=language,
        loc_class=loc_class,
        subjects=subjects,
        category=category,
        ebook_no=ebook_no,
        release_date=release_date,
        copyright_notice=copyright_notice,
        publisher=publisher,
        ebook_file=ebook_file,
        cover_image=cover_image,
    )

    await AuditService(session).log(
        action="BOOK_UPLOADED",
        user_id=admin.id,
        ip_address=_client_ip(request),
        metadata={
            "book_id": str(book.id),
            "title": book.title,
            "is_published": book.is_published,
            "total_pages": book.total_pages,
        },
    )

    return _book_response(book)


@router.post("/books/{book_id}/reparse", response_model=AdminBookCreateResponse)
async def reparse_book(
    book_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    admin: Annotated[User, Depends(get_admin_user)],
) -> AdminBookCreateResponse:
    book = await AdminBookService(session).reparse_book(book_id)
    return _book_response(book)


@router.get("/books", response_model=list[AdminBookCreateResponse])
async def list_books(
    session: Annotated[AsyncSession, Depends(get_session)],
    admin: Annotated[User, Depends(get_admin_user)],
) -> list[AdminBookCreateResponse]:
    from app.repositories.book_repository import BookRepository

    books = await BookRepository(session).list_all()
    return [_book_response(b) for b in books]
