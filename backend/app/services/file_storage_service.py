import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings

settings = get_settings()

ALLOWED_EBOOK_EXTENSIONS = {".epub", ".pdf"}
ALLOWED_EBOOK_MIME = {
    "application/epub+zip",
    "application/pdf",
    "application/x-pdf",
}
ALLOWED_COVER_EXTENSIONS = {".png", ".jpg", ".jpeg"}
ALLOWED_COVER_MIME = {"image/png", "image/jpeg", "image/jpg"}


class FileStorageService:
    def __init__(self) -> None:
        self.covers_dir = Path(settings.public_covers_path).resolve()
        self.ebooks_dir = Path(settings.secure_ebooks_path).resolve()
        self.covers_dir.mkdir(parents=True, exist_ok=True)
        self.ebooks_dir.mkdir(parents=True, exist_ok=True)

    async def save_cover(self, cover_image: UploadFile) -> str:
        ext = self._validate_cover_meta(cover_image)
        content = await self._read_limited(cover_image)
        self._validate_cover_magic(content, ext)
        filename = f"{uuid.uuid4()}{ext}"
        (self.covers_dir / filename).write_bytes(content)
        return f"{settings.public_covers_url_prefix}/{filename}"

    async def save_ebook(self, ebook_file: UploadFile) -> str:
        ext = self._validate_ebook_meta(ebook_file)
        content = await self._read_limited(ebook_file)
        self._validate_ebook_magic(content, ext)
        filename = f"{uuid.uuid4()}{ext}"
        (self.ebooks_dir / filename).write_bytes(content)
        return filename

    async def _read_limited(self, file: UploadFile) -> bytes:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
        if len(content) > settings.max_upload_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds {settings.max_upload_size_mb}MB limit",
            )
        return content

    def _validate_ebook_meta(self, file: UploadFile) -> str:
        if not file.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="eBook filename is required")
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EBOOK_EXTENSIONS:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="eBook must be EPUB or PDF")
        if file.content_type and file.content_type not in ALLOWED_EBOOK_MIME:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid eBook MIME type: {file.content_type}",
            )
        return ext

    def _validate_ebook_magic(self, content: bytes, ext: str) -> None:
        if ext == ".pdf" and not content.startswith(b"%PDF"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PDF file signature")
        if ext == ".epub" and not content.startswith(b"PK"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid EPUB file signature")

    def _validate_cover_meta(self, file: UploadFile) -> str:
        if not file.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cover filename is required")
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_COVER_EXTENSIONS:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cover must be PNG or JPG")
        if file.content_type and file.content_type not in ALLOWED_COVER_MIME:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid cover MIME type: {file.content_type}",
            )
        return ".jpg" if ext == ".jpeg" else ext

    def _validate_cover_magic(self, content: bytes, ext: str) -> None:
        if ext == ".png" and not content.startswith(b"\x89PNG\r\n\x1a\n"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PNG file signature")
        if ext == ".jpg" and not content.startswith(b"\xff\xd8\xff"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JPEG file signature")
