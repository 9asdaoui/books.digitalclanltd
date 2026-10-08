import re
import shutil
from dataclasses import dataclass, field
from pathlib import Path

import ebooklib
import fitz
from bs4 import BeautifulSoup
from ebooklib import epub

CHARS_PER_PAGE = 2500
PDF_OCR_DPI = 200


@dataclass
class ParsedBook:
    pages: list[str]
    language: str = "en"
    metadata: dict = field(default_factory=dict)
    file_format: str = ""


class EbookParserService:
    def parse(self, file_path: Path) -> ParsedBook:
        ext = file_path.suffix.lower()
        if ext == ".pdf":
            return self._parse_pdf(file_path)
        if ext == ".epub":
            return self._parse_epub(file_path)
        raise ValueError(f"Unsupported eBook format: {ext}")

    @staticmethod
    def _ocr_available() -> bool:
        return shutil.which("tesseract") is not None

    def _extract_pdf_page_text(self, page: fitz.Page, *, allow_ocr: bool) -> str:
        text = page.get_text("text").strip()
        if text or not allow_ocr:
            return text

        try:
            textpage = page.get_textpage_ocr(dpi=PDF_OCR_DPI, language="eng", full=True)
            return page.get_text("text", textpage=textpage).strip()
        except Exception:
            return ""

    def _parse_pdf(self, file_path: Path) -> ParsedBook:
        doc = fitz.open(file_path)
        pages: list[str] = []
        allow_ocr = self._ocr_available()
        try:
            for index in range(len(doc)):
                text = self._extract_pdf_page_text(doc[index], allow_ocr=allow_ocr)
                pages.append(text if text else f"[Page {index + 1} has no extractable text]")
            info = doc.metadata or {}
            metadata = {
                "author": info.get("author") or "",
                "title": info.get("title") or "",
                "publisher": info.get("producer") or info.get("creator") or "",
                "copyright": info.get("keywords") or "",
                "category": "Text",
            }
            if info.get("creationDate"):
                metadata["release_date"] = info["creationDate"]
        finally:
            doc.close()

        if not pages:
            pages = ["[This PDF has no readable pages.]"]

        return ParsedBook(pages=pages, language="en", metadata=metadata, file_format="pdf")

    def _parse_epub(self, file_path: Path) -> ParsedBook:
        book = epub.read_epub(str(file_path))
        metadata = self._extract_epub_metadata(book)
        sections: list[str] = []

        for item in book.get_items():
            if item.get_type() != ebooklib.ITEM_DOCUMENT:
                continue
            soup = BeautifulSoup(item.get_content(), "html.parser")
            for tag in soup(["script", "style", "nav"]):
                tag.decompose()
            text = soup.get_text("\n", strip=True)
            if text:
                sections.append(text)

        combined = "\n\n".join(sections).strip()
        pages = self._split_into_pages(combined) if combined else ["[This EPUB has no extractable text.]"]

        language = metadata.get("language", "en")
        if isinstance(language, str) and "-" in language:
            language = language.split("-", 1)[0]

        return ParsedBook(pages=pages, language=language or "en", metadata=metadata, file_format="epub")

    def _extract_epub_metadata(self, book: epub.EpubBook) -> dict:
        mapping = {
            "creator": "author",
            "title": "title",
            "language": "language",
            "publisher": "publisher",
            "description": "description",
            "date": "release_date",
            "identifier": "ebook_no",
            "rights": "copyright",
            "subject": "subjects",
        }
        metadata: dict = {"category": "Text"}
        subjects: list[str] = []

        for dc_key, field_name in mapping.items():
            values = book.get_metadata("DC", dc_key)
            if not values:
                continue
            for value in values:
                text = (value[0] or "").strip() if value else ""
                if not text:
                    continue
                if field_name == "subjects":
                    subjects.append(text)
                elif field_name not in metadata or not metadata[field_name]:
                    metadata[field_name] = text

        if subjects:
            metadata["subjects"] = subjects
        return metadata

    def _split_into_pages(self, text: str, chars_per_page: int = CHARS_PER_PAGE) -> list[str]:
        text = text.strip()
        if not text:
            return ["[This book has no extractable text content.]"]

        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        if not paragraphs:
            paragraphs = [text]

        expanded: list[str] = []
        for paragraph in paragraphs:
            if len(paragraph) <= chars_per_page:
                expanded.append(paragraph)
            else:
                expanded.extend(self._split_long_text(paragraph, chars_per_page))

        pages: list[str] = []
        current: list[str] = []
        current_len = 0

        for paragraph in expanded:
            if current_len + len(paragraph) > chars_per_page and current:
                pages.append("\n\n".join(current))
                current = [paragraph]
                current_len = len(paragraph)
            else:
                current.append(paragraph)
                current_len += len(paragraph) + 2

        if current:
            pages.append("\n\n".join(current))

        return pages if pages else [text[:chars_per_page]]

    def _split_long_text(self, text: str, chars_per_page: int) -> list[str]:
        chunks: list[str] = []
        remaining = text.strip()
        while remaining:
            if len(remaining) <= chars_per_page:
                chunks.append(remaining)
                break
            window = remaining[:chars_per_page]
            split_at = window.rfind("\n\n")
            if split_at < chars_per_page // 3:
                split_at = window.rfind(". ")
            if split_at < chars_per_page // 3:
                split_at = window.rfind(" ")
            if split_at < 1:
                split_at = chars_per_page
            else:
                split_at += 1
            chunks.append(remaining[:split_at].strip())
            remaining = remaining[split_at:].strip()
        return chunks
