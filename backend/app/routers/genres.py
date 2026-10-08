from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.repositories.genre_repository import GenreRepository
from app.schemas.genre import GenreResponse

router = APIRouter(prefix="/genres", tags=["genres"])


@router.get("", response_model=list[GenreResponse])
async def list_genres(session: Annotated[AsyncSession, Depends(get_session)]) -> list[GenreResponse]:
    genres = await GenreRepository(session).list_all()
    return [GenreResponse(id=str(g.id), name=g.name, slug=g.slug) for g in genres]
