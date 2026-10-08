import { Link } from "react-router-dom";
import { Book } from "../../lib/api";
import { bookAuthor } from "../reader/readerUtils";
import { Badge } from "../ui/Badge";

type FeaturedBooksProps = {
  books: Book[];
  loading: boolean;
};

export function FeaturedBooks({ books, loading }: FeaturedBooksProps) {
  if (loading) {
    return (
      <section id="catalog" className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (books.length === 0) return null;

  return (
    <section id="catalog" className="border-t border-white/10 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="landing-label">From the catalog</p>
            <h2 className="text-display mt-3 text-3xl font-bold text-surface-100 md:text-4xl">
              Titles worth your time
            </h2>
          </div>
          <p className="text-sm text-surface-500">
            {books.length} {books.length === 1 ? "book" : "books"} available
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="group flex gap-5 rounded-2xl border border-white/10 bg-surface-900/30 p-4 transition hover:border-accent-gold/30 hover:bg-surface-900/50"
            >
              <div className="landing-cover-shadow h-36 w-28 shrink-0 overflow-hidden rounded-lg">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-surface-800 text-2xl text-surface-600">
                    {book.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 py-1">
                <h3 className="text-display line-clamp-2 font-semibold text-surface-100 group-hover:text-accent-parchment">
                  {book.title}
                </h3>
                <p className="mt-1 text-sm text-surface-500">{bookAuthor(book)}</p>
                {book.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-surface-400">
                    {book.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="brand">{book.total_pages} pages</Badge>
                  <Badge variant="warning">{book.free_page_limit} free</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
