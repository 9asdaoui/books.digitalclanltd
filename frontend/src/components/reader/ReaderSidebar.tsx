import { Book } from "../../lib/api";
import { metaValue } from "./readerUtils";
import { cn } from "../../lib/cn";

type ReaderSidebarProps = {
  book: Book;
  open: boolean;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  onJump: (page: number) => void;
};

export function ReaderSidebar({ book, open, onClose, currentPage, totalPages, onJump }: ReaderSidebarProps) {
  const rows = [
    { label: "Author", value: metaValue(book, "author") || metaValue(book, "author_name") },
    { label: "Title", value: book.title },
    { label: "Original Publication", value: metaValue(book, "original_publication") },
    { label: "Series Title", value: metaValue(book, "series_title") },
    { label: "Credits", value: metaValue(book, "credits") },
    { label: "Language", value: metaValue(book, "language") || book.language },
    { label: "LoC Class", value: metaValue(book, "loc_class") },
    { label: "Subject", value: metaValue(book, "subjects") },
    { label: "Category", value: metaValue(book, "category") },
    { label: "eBook-No.", value: metaValue(book, "ebook_no") },
    { label: "Release Date", value: metaValue(book, "release_date") },
    { label: "Copyright", value: metaValue(book, "copyright") },
  ].filter((r) => r.value);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "reader-sidebar fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-display text-lg font-semibold">About this eBook</h2>
          <button type="button" onClick={onClose} className="text-sm opacity-60 hover:opacity-100">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {book.cover_url && (
            <img src={book.cover_url} alt="" className="mx-auto mb-6 h-48 w-36 rounded-lg object-cover shadow-lg" />
          )}
          {book.description && (
            <p className="mb-6 text-sm leading-relaxed opacity-80">{book.description}</p>
          )}
          <dl className="space-y-3 text-sm">
            {rows.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-wider opacity-50">{label}</dt>
                <dd className="mt-1 leading-relaxed">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-t px-5 py-4">
          <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Jump to page</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => onJump(Number(e.target.value))}
              className="reader-slider flex-1"
            />
            <span className="w-16 text-right text-sm tabular-nums">
              {currentPage}/{totalPages}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
