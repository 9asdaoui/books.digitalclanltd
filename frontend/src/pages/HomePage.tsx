import { useCallback, useEffect, useState } from "react";
import { PaywallModal } from "../components/PaywallModal";
import { AppShell } from "../components/layout/AppShell";
import { ReaderHeader } from "../components/layout/ReaderHeader";
import { Badge, Button, Card, CardTitle, Select } from "../components/ui";
import { fetchBooks, fetchGenres, fetchHealth, fetchPage } from "../lib/api";
import { getToken } from "../lib/auth";
import { listOfflineBooks } from "../offline/db";

type HealthState = { status: string; loading: boolean; error?: string };

export default function HomePage() {
  const [health, setHealth] = useState<HealthState>({ status: "checking", loading: true });
  const [genreCount, setGenreCount] = useState(0);
  const [books, setBooks] = useState<Array<{ id: string; title: string; free_page_limit: number }>>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [pageResult, setPageResult] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallLimit, setPaywallLimit] = useState<number | undefined>();
  const [offlineCount, setOfflineCount] = useState(0);
  const [token] = useState<string | null>(getToken());

  const loadConnectivity = useCallback(async () => {
    setHealth({ status: "checking", loading: true });
    try {
      const data = await fetchHealth();
      setHealth({ status: (data.status as string) || "ok", loading: false });
      const genres = await fetchGenres();
      setGenreCount(genres.length);
      const bookList = await fetchBooks();
      setBooks(bookList);
      if (bookList.length > 0 && !selectedBookId) setSelectedBookId(bookList[0].id);
      const offline = await listOfflineBooks();
      setOfflineCount(offline.length);
    } catch (err) {
      setHealth({
        status: "error",
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }, [selectedBookId]);

  useEffect(() => {
    loadConnectivity();
  }, [loadConnectivity]);

  const testPaywall = async (pageNumber: number) => {
    if (!selectedBookId) return;
    setShowPaywall(false);
    setPageResult("Loading...");
    const result = await fetchPage(selectedBookId, pageNumber, token ?? undefined);
    if (result.status === 402) {
      const body = result.data as { message?: string; free_page_limit?: number };
      setPaywallLimit(body.free_page_limit);
      setShowPaywall(true);
      setPageResult(
        `402 Payment Required — ${body.message ?? "Subscribe to continue"} (free limit: ${body.free_page_limit ?? "?"})`,
      );
      return;
    }
    if (result.ok) {
      const body = result.data as { content?: string; page_number?: number };
      setPageResult(`Page ${body.page_number}: ${body.content?.slice(0, 120)}...`);
    } else {
      setPageResult(`Error ${result.status}: ${JSON.stringify(result.data)}`);
    }
  };

  return (
    <AppShell variant="reader">
      <ReaderHeader />

      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <Card variant="solid" padding="sm">
          <CardTitle className="mb-3 text-base">API Health</CardTitle>
          {health.loading ? (
            <p className="text-sm text-amber-400">Checking /api/health...</p>
          ) : health.error ? (
            <p className="text-sm text-red-400">Failed: {health.error}</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">Connected</Badge>
              <span className="text-sm text-surface-400">
                status: <strong className="text-surface-200">{health.status}</strong> · genres: {genreCount} ·
                offline: {offlineCount}
              </span>
            </div>
          )}
          <Button variant="secondary" size="sm" className="mt-3" onClick={loadConnectivity}>
            Retry
          </Button>
        </Card>

        <Card variant="solid" padding="sm">
          <CardTitle className="mb-3 text-base">Paywall (402) Test</CardTitle>
          {books.length > 0 ? (
            <>
              <Select
                className="mb-3"
                value={selectedBookId ?? ""}
                onChange={(e) => setSelectedBookId(e.target.value)}
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} (free pages: {b.free_page_limit})
                  </option>
                ))}
              </Select>
              <div className="flex flex-wrap gap-2">
                <Button variant="success" size="sm" onClick={() => testPaywall(3)}>
                  Read page 3 (free)
                </Button>
                <Button variant="paywall" size="sm" onClick={() => testPaywall(10)}>
                  Read page 10 (paywall)
                </Button>
              </div>
              {pageResult && (
                <p className="text-reader mt-4 rounded-xl border border-white/10 bg-surface-950/50 p-4 text-sm text-surface-300">
                  {pageResult}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-surface-400">No published books yet.</p>
          )}
        </Card>
      </main>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        freePageLimit={paywallLimit}
        paypalClientId={import.meta.env.VITE_PAYPAL_CLIENT_ID}
      />
    </AppShell>
  );
}
