import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Calendar,
  Globe,
  Layers,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { MarketingLayout } from "../components/layout/MarketingLayout";
import { bookAuthor, metaValue } from "../components/reader/readerUtils";
import { Badge, Button, Spinner } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { Book, fetchBook, fetchGenres, Genre } from "../lib/api";
import { cn } from "../lib/cn";

function DetailStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/50 px-4 py-3">
      <div className="flex items-center gap-2 text-surface-500">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-surface-100">{value}</p>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/5 py-3 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-surface-500">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-surface-200">{value}</dd>
    </div>
  );
}

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [genreName, setGenreName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    setError(null);
    Promise.all([fetchBook(bookId), fetchGenres()])
      .then(([b, genres]) => {
        setBook(b);
        const genre = genres.find((g: Genre) => g.id === b.genre_id);
        setGenreName(genre?.name ?? null);
      })
      .catch(() => setError("This book could not be found or is no longer available."))
      .finally(() => setLoading(false));
  }, [bookId]);

  const metadataRows = book
    ? [
        { label: "Author", value: bookAuthor(book) },
        { label: "Original publication", value: metaValue(book, "original_publication") },
        { label: "Series", value: metaValue(book, "series_title") },
        { label: "Publisher", value: metaValue(book, "publisher") },
        { label: "Language", value: metaValue(book, "language") || book.language },
        { label: "Category", value: metaValue(book, "category") },
        { label: "LoC class", value: metaValue(book, "loc_class") },
        { label: "Subjects", value: metaValue(book, "subjects") },
        { label: "Release date", value: metaValue(book, "release_date") },
        { label: "Copyright", value: metaValue(book, "copyright") },
        { label: "Credits", value: metaValue(book, "credits") },
      ].filter((row) => row.value)
    : [];

  const fileFormat =
    book && typeof book.metadata_extra?.file_format === "string"
      ? book.metadata_extra.file_format.toUpperCase()
      : null;

  return (
    <MarketingLayout>
      <section className="px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-sm text-surface-400 transition hover:text-brand-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>

          {loading ? (
            <div className="flex justify-center py-32">
              <Spinner size="lg" className="text-brand-400" />
            </div>
          ) : error || !book ? (
            <div className="py-32 text-center">
              <p className="text-surface-400">{error ?? "Book not found."}</p>
              <Link to="/store" className="mt-6 inline-block">
                <Button variant="secondary">Return to store</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(260px,320px)_1fr] lg:gap-14">
                {/* Cover */}
                <div className="mx-auto w-full max-w-xs lg:mx-0 lg:max-w-none">
                  <div className="glow-ring sticky top-24 overflow-hidden rounded-3xl border border-white/10 bg-surface-900/60 shadow-2xl shadow-black/40">
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-brand-900/30 to-surface-800">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-display text-6xl font-bold text-brand-500/30">
                            {book.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-white/10 bg-surface-950/80 p-4">
                      <p className="text-center text-xs text-surface-500">
                        {book.total_pages} pages · {book.free_page_limit} free preview
                        {book.free_page_limit === 1 ? "" : " pages"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {genreName && (
                      <Badge variant="brand" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {genreName}
                      </Badge>
                    )}
                    {fileFormat && <Badge variant="draft">{fileFormat}</Badge>}
                    <Badge variant="warning">{book.free_page_limit} free pages</Badge>
                  </div>

                  <h1 className="text-display mt-5 text-4xl font-bold leading-tight text-surface-50 md:text-5xl">
                    {book.title}
                  </h1>

                  <p className="mt-3 flex items-center gap-2 text-lg text-surface-300">
                    <User className="h-5 w-5 text-surface-500" />
                    {bookAuthor(book)}
                  </p>

                  {metaValue(book, "series_title") && (
                    <p className="mt-2 text-sm text-surface-400">{metaValue(book, "series_title")}</p>
                  )}

                  {book.description && (
                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-surface-300 md:text-lg">
                      {book.description}
                    </p>
                  )}

                  <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailStat icon={Layers} label="Length" value={`${book.total_pages} pages`} />
                    <DetailStat
                      icon={Sparkles}
                      label="Preview"
                      value={`First ${book.free_page_limit} pages free`}
                    />
                    <DetailStat
                      icon={Globe}
                      label="Language"
                      value={(metaValue(book, "language") || book.language).toUpperCase()}
                    />
                    <DetailStat
                      icon={Calendar}
                      label="Release"
                      value={metaValue(book, "release_date") || "Available now"}
                    />
                  </div>

                  <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      size="lg"
                      className="min-w-[220px] gap-2"
                      onClick={() => navigate(`/read/${book.id}`)}
                    >
                      <BookOpen className="h-5 w-5" />
                      {user ? "Continue reading" : "Start reading"}
                    </Button>
                    {!user && (
                      <Link to="/signup" state={{ from: `/books/${book.id}` }}>
                        <Button variant="secondary" size="lg" className="min-w-[220px] gap-2">
                          <Bookmark className="h-5 w-5" />
                          Create free account
                        </Button>
                      </Link>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-surface-500">
                    Read instantly in your browser. No download required — secure streaming with offline
                    support for subscribers.
                  </p>
                </div>
              </div>

              {metadataRows.length > 0 && (
                <div className="mt-16 rounded-3xl border border-white/10 bg-surface-900/40 p-6 md:p-8">
                  <h2 className="text-display text-xl font-semibold text-surface-100">Book details</h2>
                  <p className="mt-1 text-sm text-surface-500">Publication info and catalog metadata</p>
                  <dl className={cn("mt-6 grid gap-x-10 md:grid-cols-2")}>
                    {metadataRows.map((row) => (
                      <MetadataRow key={row.label} label={row.label} value={row.value!} />
                    ))}
                  </dl>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
