from pydantic import BaseModel, Field


class BookResponse(BaseModel):
    id: str
    title: str
    author_id: str
    description: str | None
    genre_id: str | None
    cover_url: str | None
    total_pages: int
    free_page_limit: int
    is_published: bool
    language: str
    metadata_extra: dict = Field(default_factory=dict)


def book_to_response(book) -> BookResponse:
    return BookResponse(
        id=str(book.id),
        title=book.title,
        author_id=str(book.author_id),
        description=book.description,
        genre_id=str(book.genre_id) if book.genre_id else None,
        cover_url=book.cover_url,
        total_pages=book.total_pages,
        free_page_limit=book.free_page_limit,
        is_published=book.is_published,
        language=book.language,
        metadata_extra=book.metadata_extra or {},
    )


class PageContentResponse(BaseModel):
    book_id: str
    page_number: int
    content: str
    total_pages: int
    free_page_limit: int


class PaymentRequiredResponse(BaseModel):
    detail: str = "payment_required"
    message: str
    free_page_limit: int
    book_id: str
    upgrade_url: str = "/subscribe"
