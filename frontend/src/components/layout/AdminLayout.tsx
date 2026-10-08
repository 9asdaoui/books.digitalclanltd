import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Library,
  LogOut,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { BrandLogo } from "../brand/BrandLogo";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/cn";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/upload", label: "Upload Book", icon: Upload },
  { to: "/admin/library", label: "Library", icon: Library },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-surface-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-surface-900/80 lg:flex">
        <div className="border-b border-white/10 p-6">
          <BrandLogo variant="full" size="sm" href="/admin" />
          <p className="mt-2 text-[10px] uppercase tracking-widest text-surface-500">Publisher admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {links.map(({ to, label, icon: Icon, end }) => {
            const active = end ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-brand-500/15 text-brand-400 border border-brand-500/25"
                    : "text-surface-400 hover:bg-white/5 hover:text-surface-200",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate px-2 text-xs text-surface-500">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-surface-400 hover:bg-white/5 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <Link
            to="/"
            className="mt-2 flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-surface-400 hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-surface-900/50 px-6 py-4 lg:hidden">
          <p className="text-display font-bold">Admin</p>
          <Link to="/store" className="text-sm text-brand-400">
            Exit
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
