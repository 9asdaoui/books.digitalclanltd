import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.deps import get_optional_user
from app.models.user import User
from app.repositories.book_repository import BookRepository
from app.schemas.book import BookResponse, PageContentResponse, PaymentRequiredResponse, book_to_response
from app.services.content_protection_service import ContentProtectionService
from app.services.exceptions import PaymentRequiredError

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=list[BookResponse])
async def list_books(session: Annotated[AsyncSession, Depends(get_session)]) -> list[BookResponse]:
    books = await BookRepository(session).list_published()
    return [book_to_response(b) for b in books]


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> BookResponse:
    book = await BookRepository(session).get_by_id(book_id)
    if book is None or not book.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return book_to_response(book)


@router.get("/{book_id}/pages/{page_number}", response_model=PageContentResponse)
async def get_page(
    book_id: uuid.UUID,
    page_number: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User | None, Depends(get_optional_user)],
):
    service = ContentProtectionService(session)
    try:
        data = await service.get_protected_page_content(current_user, book_id, page_number)
        return PageContentResponse(**data)
    except PaymentRequiredError as exc:
        body = PaymentRequiredResponse(
            message=exc.message,
            free_page_limit=exc.free_page_limit,
            book_id=str(exc.book_id),
        )
        return JSONResponse(status_code=402, content=body.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
