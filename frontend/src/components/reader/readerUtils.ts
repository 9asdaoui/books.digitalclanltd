import { Book } from "../../lib/api";

export function metaValue(book: Book, key: string): string | null {
  const value = book.metadata_extra?.[key];
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && value.length > 0) return value.join(", ");
  return null;
}

export function bookAuthor(book: Book): string {
  return metaValue(book, "author") || metaValue(book, "author_name") || "Unknown author";
}

export function formatContent(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function contentParagraphs(text: string): string[] {
  return formatContent(text).split(/\n\n+/).filter(Boolean);
}
