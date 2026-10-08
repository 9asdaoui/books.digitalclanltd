import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import engine
from app.core.logging_config import setup_logging
from app.core.middleware import RequestLoggingMiddleware
from app.routers import admin, auth, books, genres, health, subscriptions

settings = get_settings()
setup_logging(settings.app_env)
logger = logging.getLogger(__name__)

_fastapi_kwargs: dict = {
    "title": "Digital Clan Books API",
    "version": "1.0.0",
}
if settings.is_production:
    _fastapi_kwargs.update(docs_url=None, redoc_url=None, openapi_url=None)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting API env=%s", settings.app_env)
    yield
    await engine.dispose()
    logger.info("API shutdown complete")


app = FastAPI(lifespan=lifespan, **_fastapi_kwargs)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(books.router)
app.include_router(genres.router)
app.include_router(subscriptions.router)


@app.get("/")
async def root() -> dict:
    payload: dict = {"message": "Digital Clan Books API", "env": settings.app_env}
    if not settings.is_production:
        payload["docs"] = "/docs"
    return payload
