import { ReaderFontSize } from "../../hooks/useReaderSettings";
import { contentParagraphs } from "./readerUtils";
import { cn } from "../../lib/cn";
import { Spinner } from "../ui/Spinner";

type ReaderContentProps = {
  content: string;
  page: number;
  fontSize: ReaderFontSize;
  loading: boolean;
  error: string;
};

const fontSizeClass: Record<ReaderFontSize, string> = {
  sm: "reader-text-sm",
  md: "reader-text-md",
  lg: "reader-text-lg",
  xl: "reader-text-xl",
};

export function ReaderContent({ content, page, fontSize, loading, error }: ReaderContentProps) {
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="reader-error mx-auto max-w-lg rounded-2xl border p-8 text-center">
        <p className="text-lg font-semibold">Could not load this page</p>
        <p className="mt-2 text-sm opacity-70">{error}</p>
      </div>
    );
  }

  if (!content.trim()) {
    return (
      <div className="reader-error mx-auto max-w-lg rounded-2xl border p-8 text-center">
        <p className="text-lg font-semibold">No content on this page</p>
        <p className="mt-2 text-sm opacity-70">
          Try re-parsing this book from Admin → Library → Reparse.
        </p>
      </div>
    );
  }

  const paragraphs = contentParagraphs(content);

  return (
    <article
      key={page}
      className={cn("reader-article animate-reader-fade", fontSizeClass[fontSize])}
    >
      <p className="reader-page-label">Page {page}</p>
      {paragraphs.map((para, i) => (
        <p key={i} className={cn("reader-paragraph", i === 0 && page === 1 && "reader-dropcap")}>
          {para}
        </p>
      ))}
    </article>
  );
}
