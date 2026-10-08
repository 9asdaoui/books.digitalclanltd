import { Link } from "react-router-dom";
import { Book } from "../../lib/api";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/cn";

type BookCardProps = {
  book: Book;
  genreName?: string;
  authorName?: string;
};

export function BookCard({ book, genreName, authorName }: BookCardProps) {
  const cover = book.cover_url || null;

  return (
    <Link to={`/books/${book.id}`} className="group block">
      <article className="card-hover glow-ring overflow-hidden rounded-2xl border border-white/10 bg-surface-900/60">
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-brand-900/40 to-surface-800">
          {cover ? (
            <img
              src={cover}
              alt={book.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-display text-4xl font-bold text-brand-500/30">
                {book.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950/90 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
            <span className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white">
              View details →
            </span>
          </div>
          <Badge variant="warning" className="absolute right-3 top-3">
            {book.free_page_limit} free pages
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="text-display line-clamp-2 font-semibold text-surface-100 group-hover:text-brand-400">
            {book.title}
          </h3>
          <p className="mt-1 text-sm text-surface-500">
            {(authorName ||
              (typeof book.metadata_extra?.author === "string" && book.metadata_extra.author) ||
              (typeof book.metadata_extra?.author_name === "string" && book.metadata_extra.author_name) ||
              "Digital Clan")}
            {genreName && ` · ${genreName}`}
          </p>
          {book.description && (
            <p className="mt-2 line-clamp-2 text-xs text-surface-400">{book.description}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="brand">{book.total_pages} pages</Badge>
            <Badge variant="draft">{book.language.toUpperCase()}</Badge>
          </div>
        </div>
      </article>
    </Link>
  );
}
