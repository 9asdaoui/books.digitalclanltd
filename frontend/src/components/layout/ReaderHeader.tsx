import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

type ReaderHeaderProps = {
  actions?: React.ReactNode;
};

const navLinkClass = cn(
  "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition duration-150",
  "border border-white/10 bg-white/5 text-surface-200 hover:bg-white/10",
);

export function ReaderHeader({ actions }: ReaderHeaderProps) {
  return (
    <header className="glass-header">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <div>
          <p className="label-brand">Digital Clan Books</p>
          <h1 className="text-display text-xl font-bold tracking-tight text-surface-100">Reader</h1>
        </div>
        <nav className="flex items-center gap-3">
          {actions}
          <Link to="/admin" className={navLinkClass}>
            Admin CMS
          </Link>
        </nav>
      </div>
    </header>
  );
}
