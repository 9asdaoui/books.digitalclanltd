import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Type,
} from "lucide-react";
import { Book } from "../../lib/api";
import { ReaderFontSize, ReaderTheme } from "../../hooks/useReaderSettings";
import { bookAuthor } from "./readerUtils";
import { cn } from "../../lib/cn";

type ReaderToolbarProps = {
  book: Book;
  page: number;
  totalPages: number;
  theme: ReaderTheme;
  fontSize: ReaderFontSize;
  focusMode: boolean;
  onThemeChange: (theme: ReaderTheme) => void;
  onFontSizeChange: (size: ReaderFontSize) => void;
  onToggleFocus: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  visible: boolean;
};

const fontSizes: ReaderFontSize[] = ["sm", "md", "lg", "xl"];
const themes: { id: ReaderTheme; icon: typeof Sun; label: string }[] = [
  { id: "light", icon: Sun, label: "Light" },
  { id: "sepia", icon: BookOpen, label: "Sepia" },
  { id: "dark", icon: Moon, label: "Dark" },
];

export function ReaderToolbar({
  book,
  page,
  totalPages,
  theme,
  fontSize,
  focusMode,
  onThemeChange,
  onFontSizeChange,
  onToggleFocus,
  onToggleSidebar,
  sidebarOpen,
  visible,
}: ReaderToolbarProps) {
  const progress = totalPages > 0 ? Math.round((page / totalPages) * 100) : 0;

  return (
    <header
      className={cn(
        "reader-chrome fixed inset-x-0 top-0 z-50 transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="reader-toolbar border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            to={`/books/${book.id}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-surface-500 transition hover:bg-black/5 hover:text-brand-500"
            aria-label="Back to book details"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            {book.cover_url && (
              <img
                src={book.cover_url}
                alt=""
                className="hidden h-10 w-8 shrink-0 rounded object-cover shadow sm:block"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{book.title}</p>
              <p className="truncate text-xs opacity-60">{bookAuthor(book)}</p>
            </div>
          </div>

          <div className="hidden items-center gap-1 sm:flex">
            {themes.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                title={label}
                onClick={() => onThemeChange(id)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition",
                  theme === id ? "bg-brand-500/20 text-brand-500" : "opacity-50 hover:opacity-100",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const idx = fontSizes.indexOf(fontSize);
                if (idx > 0) onFontSizeChange(fontSizes[idx - 1]);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg opacity-60 hover:opacity-100"
              aria-label="Decrease font size"
            >
              <Type className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const idx = fontSizes.indexOf(fontSize);
                if (idx < fontSizes.length - 1) onFontSizeChange(fontSizes[idx + 1]);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-base font-semibold opacity-60 hover:opacity-100"
              aria-label="Increase font size"
            >
              <Type className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onToggleSidebar}
              className={cn(
                "hidden h-8 rounded-lg px-2 text-xs font-medium sm:inline-flex",
                sidebarOpen ? "bg-brand-500/15 text-brand-500" : "opacity-60 hover:opacity-100",
              )}
            >
              Details
            </button>
            <button
              type="button"
              onClick={onToggleFocus}
              className="flex h-8 w-8 items-center justify-center rounded-lg opacity-60 hover:opacity-100"
              aria-label={focusMode ? "Exit focus mode" : "Focus mode"}
            >
              {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="reader-progress h-1 w-full">
          <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </header>
  );
}
