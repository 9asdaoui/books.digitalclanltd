from pydantic import BaseModel, Field


class AdminBookCreateResponse(BaseModel):
    id: str
    title: str
    author_id: str
    genre_id: str | None
    cover_url: str | None
    file_encrypted_path: str | None
    total_pages: int
    free_page_limit: int
    is_published: bool
    metadata_extra: dict = Field(default_factory=dict)
