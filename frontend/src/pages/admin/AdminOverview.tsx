import { useEffect, useState } from "react";
import { BookOpen, Library, Tags, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardTitle, Spinner } from "../../components/ui";
import { fetchAdminBooks, fetchGenres } from "../../lib/api";
import { getToken } from "../../lib/auth";

export default function AdminOverview() {
  const [stats, setStats] = useState({ books: 0, published: 0, genres: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([fetchAdminBooks(token), fetchGenres()])
      .then(([books, genres]) => {
        setStats({
          books: books.length,
          published: books.filter((b) => b.is_published).length,
          drafts: books.filter((b) => !b.is_published).length,
          genres: genres.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total books", value: stats.books, icon: BookOpen, color: "text-brand-400" },
    { label: "Published", value: stats.published, icon: Library, color: "text-emerald-400" },
    { label: "Drafts", value: stats.drafts, icon: Upload, color: "text-amber-400" },
    { label: "Genres", value: stats.genres, icon: Tags, color: "text-violet-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="label-brand">Dashboard</p>
        <h1 className="text-display text-3xl font-bold text-surface-100">Overview</h1>
        <p className="mt-2 text-surface-400">Manage your catalog, uploads, and publishing workflow.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-brand-400" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, color }, i) => (
            <Card key={label} className="card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">{label}</p>
                  <p className="text-display mt-1 text-3xl font-bold text-surface-100">{value}</p>
                </div>
                <div className={`rounded-xl bg-white/5 p-3 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="text-base">Quick actions</CardTitle>
          <div className="space-y-3">
            <Link
              to="/admin/upload"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
            >
              <Upload className="h-4 w-4 text-brand-400" />
              Upload a new book
            </Link>
            <Link
              to="/admin/library"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
            >
              <Library className="h-4 w-4 text-brand-400" />
              Manage library
            </Link>
            <Link
              to="/store"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
            >
              <BookOpen className="h-4 w-4 text-brand-400" />
              View public store
            </Link>
          </div>
        </Card>
        <Card>
          <CardTitle className="text-base">Platform status</CardTitle>
          <ul className="space-y-2 text-sm text-surface-400">
            <li className="flex justify-between">
              <span>API</span>
              <span className="text-emerald-400">Operational</span>
            </li>
            <li className="flex justify-between">
              <span>Storage</span>
              <span className="text-emerald-400">Connected</span>
            </li>
            <li className="flex justify-between">
              <span>PayPal</span>
              <span className="text-amber-400">Configure in .env</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
