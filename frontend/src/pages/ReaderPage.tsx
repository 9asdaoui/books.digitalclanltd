import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PaywallModal } from "../components/PaywallModal";
import { ReaderContent } from "../components/reader/ReaderContent";
import { ReaderFooter } from "../components/reader/ReaderFooter";
import { ReaderSidebar } from "../components/reader/ReaderSidebar";
import { ReaderToolbar } from "../components/reader/ReaderToolbar";
import { Button, Spinner } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import {
  getReadingProgress,
  saveReadingProgress,
  useReaderSettings,
} from "../hooks/useReaderSettings";
import { Book, fetchBook, fetchPage } from "../lib/api";
import { getToken } from "../lib/auth";
import { cn } from "../lib/cn";

export default function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const { theme, fontSize, focusMode, setTheme, setFontSize, toggleFocusMode } = useReaderSettings();

  const [book, setBook] = useState<Book | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallLimit, setPaywallLimit] = useState<number>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);

  const loadingRef = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const isSubscriber = Boolean(user?.is_subscriber || isAdmin);

  const goToPage = useCallback(
    async (pageNum: number) => {
      if (!bookId || pageNum < 1 || loadingRef.current) return;
      loadingRef.current = true;
      setPageLoading(true);
      setPageError("");
      setShowPaywall(false);

      const token = getToken() ?? undefined;
      const result = await fetchPage(bookId, pageNum, token);

      if (result.status === 402) {
        const body = result.data as { free_page_limit?: number };
        setPaywallLimit(body.free_page_limit);
        setShowPaywall(true);
        setPageLoading(false);
        loadingRef.current = false;
        return;
      }

      if (result.ok) {
        const body = result.data as { content?: string; page_number?: number; total_pages?: number };
        const nextPage = body.page_number ?? pageNum;
        setContent(body.content ?? "");
        setPage(nextPage);
        if (body.total_pages) setTotalPages(body.total_pages);
        saveReadingProgress(bookId, nextPage);
        setSearchParams({ page: String(nextPage) }, { replace: true });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const body = result.data as { detail?: string };
        setPageError(body.detail ?? "Failed to load this page.");
        setContent("");
      }

      setPageLoading(false);
      loadingRef.current = false;
    },
    [bookId, setSearchParams],
  );

  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const fetched = await fetchBook(bookId);
        if (cancelled) return;
        setBook(fetched);
        setTotalPages(fetched.total_pages);

        const urlPage = Number(searchParams.get("page"));
        const savedPage = getReadingProgress(bookId);
        const startPage =
          urlPage >= 1 && urlPage <= fetched.total_pages
            ? urlPage
            : savedPage >= 1 && savedPage <= fetched.total_pages
              ? savedPage
              : 1;

        await goToPage(startPage);
      } catch {
        if (!cancelled) setBook(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookId]); // intentionally only on bookId change

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        if (page > 1) goToPage(page - 1);
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        if (page < totalPages) goToPage(page + 1);
      }
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToPage, page, totalPages]);

  useEffect(() => {
    if (!focusMode) {
      setChromeVisible(true);
      return;
    }
    const show = () => {
      setChromeVisible(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setChromeVisible(false), 2500);
    };
    show();
    window.addEventListener("mousemove", show);
    window.addEventListener("touchstart", show);
    return () => {
      window.removeEventListener("mousemove", show);
      window.removeEventListener("touchstart", show);
      clearTimeout(hideTimer.current);
    };
  }, [focusMode]);

  if (loading) {
    return (
      <div className="reader-shell reader-theme-sepia flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="text-brand-500" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="reader-shell reader-theme-dark flex min-h-screen flex-col items-center justify-center gap-4">
        <p>Book not found</p>
        <Link to="/store"><Button variant="secondary">Back to store</Button></Link>
      </div>
    );
  }

  const effectiveTotal = totalPages || book.total_pages;

  return (
    <div className={cn("reader-shell", `reader-theme-${theme}`, focusMode && "reader-focus-mode")}>
      <ReaderToolbar
        book={book}
        page={page}
        totalPages={effectiveTotal}
        theme={theme}
        fontSize={fontSize}
        focusMode={focusMode}
        onThemeChange={setTheme}
        onFontSizeChange={setFontSize}
        onToggleFocus={toggleFocusMode}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
        visible={chromeVisible}
      />

      <main
        className="reader-main mx-auto w-full max-w-3xl px-6 pb-36 pt-24"
        onClick={() => focusMode && setChromeVisible((v) => !v)}
      >
        <ReaderContent
          content={content}
          page={page}
          fontSize={fontSize}
          loading={pageLoading}
          error={pageError}
        />
      </main>

      <ReaderFooter
        page={page}
        totalPages={effectiveTotal}
        freePageLimit={book.free_page_limit}
        isSubscriber={isSubscriber}
        loading={pageLoading}
        onPrev={() => goToPage(page - 1)}
        onNext={() => goToPage(page + 1)}
        onJump={goToPage}
        visible={chromeVisible}
      />

      <ReaderSidebar
        book={book}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={page}
        totalPages={effectiveTotal}
        onJump={(p) => {
          goToPage(p);
          setSidebarOpen(false);
        }}
      />

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        freePageLimit={paywallLimit ?? book.free_page_limit}
        paypalClientId={import.meta.env.VITE_PAYPAL_CLIENT_ID}
      />
    </div>
  );
}
