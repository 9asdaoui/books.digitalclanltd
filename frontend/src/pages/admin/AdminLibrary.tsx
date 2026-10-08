import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Search } from "lucide-react";
import { Badge, Card, Input, Spinner } from "../../components/ui";
import { AdminBook, fetchAdminBooks, fetchGenres, reparseAdminBook } from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function AdminLibrary() {
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [genres, setGenres] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const [reparsingId, setReparsingId] = useState<string | null>(null);

  const loadBooks = () => {
    const token = getToken();
    if (!token) return;
    Promise.all([fetchAdminBooks(token), fetchGenres()])
      .then(([bookList, genreList]) => {
        setBooks(bookList);
        setGenres(Object.fromEntries(genreList.map((g) => [g.id, g.name])));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleReparse = async (bookId: string) => {
    const token = getToken();
    if (!token) return;
    setReparsingId(bookId);
    try {
      const updated = await reparseAdminBook(bookId, token);
      setBooks((prev) => prev.map((b) => (b.id === bookId ? updated : b)));
    } finally {
      setReparsingId(null);
    }
  };

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (filter === "published" && !b.is_published) return false;
      if (filter === "draft" && b.is_published) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const author =
        typeof b.metadata_extra?.author_name === "string" ? b.metadata_extra.author_name : "";
      return (
        b.title.toLowerCase().includes(q) ||
        author.toLowerCase().includes(q) ||
        (b.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [books, filter, query]);

  return (
    <div className="space-y-8">
      <div>
        <p className="label-brand">Catalog</p>
        <h1 className="text-display text-3xl font-bold text-surface-100">Library</h1>
        <p className="mt-2 text-surface-400">All books in your catalog — published and drafts.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
          <Input
            placeholder="Search by title or author..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
                filter === f
                  ? "bg-brand-500/15 text-brand-400 border border-brand-500/25"
                  : "text-surface-400 hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-brand-400" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-surface-400">No books match your filters.</p>
          <Link to="/admin/upload" className="mt-4 inline-block text-sm text-brand-400 hover:underline">
            Upload your first book →
          </Link>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-900/80 text-xs uppercase tracking-wider text-surface-500">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="hidden px-4 py-3 md:table-cell">Genre</th>
                <th className="hidden px-4 py-3 sm:table-cell">Pages</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-surface-900/40">
              {filtered.map((book) => {
                const author =
                  typeof book.metadata_extra?.author_name === "string"
                    ? book.metadata_extra.author_name
                    : null;
                return (
                  <tr key={book.id} className="hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt=""
                            className="h-12 w-9 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-9 items-center justify-center rounded bg-brand-900/40 text-xs font-bold text-brand-400">
                            {book.title.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-surface-100">{book.title}</p>
                          <p className="text-xs text-surface-500">{author || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 text-surface-400 md:table-cell">
                      {book.genre_id ? genres[book.genre_id] ?? "—" : "—"}
                    </td>
                    <td className="hidden px-4 py-4 text-surface-400 sm:table-cell">
                      {book.total_pages} ({book.free_page_limit} free)
                    </td>
                    <td className="px-4 py-4">
                      {book.is_published ? (
                        <Badge variant="subscriber" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Live
                        </Badge>
                      ) : (
                        <Badge variant="draft" className="gap-1">
                          <EyeOff className="h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => handleReparse(book.id)}
                        disabled={reparsingId === book.id}
                        className="text-xs text-amber-400 hover:underline disabled:opacity-50"
                      >
                        {reparsingId === book.id ? "Parsing..." : "Reparse"}
                      </button>
                      {book.is_published && (
                        <Link to={`/books/${book.id}`} className="text-xs text-brand-400 hover:underline">
                          Preview
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
