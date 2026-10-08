import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MarketingLayout } from "../components/layout/MarketingLayout";
import { BookCard } from "../components/store/BookCard";
import { Input, Spinner } from "../components/ui";
import { Book, fetchBooks, fetchGenres, Genre } from "../lib/api";
import { cn } from "../lib/cn";

export default function StorePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchBooks(), fetchGenres()])
      .then(([b, g]) => {
        setBooks(b);
        setGenres(g);
      })
      .finally(() => setLoading(false));
  }, []);

  const genreMap = useMemo(() => Object.fromEntries(genres.map((g) => [g.id, g.name])), [genres]);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.description?.toLowerCase().includes(search.toLowerCase());
      const matchGenre = !genreFilter || b.genre_id === genreFilter;
      return matchSearch && matchGenre;
    });
  }, [books, search, genreFilter]);

  return (
    <MarketingLayout>
      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-brand">Catalog</p>
              <h1 className="text-display text-4xl font-bold text-surface-100">Book Store</h1>
              <p className="mt-2 text-surface-400">
                {books.length} titles available · Free previews on every book
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
              <Input
                className="pl-11"
                placeholder="Search titles, authors, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setGenreFilter(null)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                !genreFilter
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                  : "bg-white/5 text-surface-400 border border-white/10 hover:bg-white/10",
              )}
            >
              All
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGenreFilter(g.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition",
                  genreFilter === g.id
                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                    : "bg-white/5 text-surface-400 border border-white/10 hover:bg-white/10",
                )}
              >
                {g.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner size="lg" className="text-brand-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-surface-400">No books match your search.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  genreName={book.genre_id ? genreMap[book.genre_id] : undefined}
                />
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <p className="mt-10 text-center text-sm text-surface-500">
              Showing {filtered.length} of {books.length} books
            </p>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
