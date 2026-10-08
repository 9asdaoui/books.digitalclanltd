import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

type AdminHeaderProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

const navLinkClass = cn(
  "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition duration-150",
  "border border-white/10 bg-white/5 text-surface-200 hover:bg-white/10",
);

export function AdminHeader({
  title = "Content Management",
  subtitle = "Digital Clan Ltd",
  actions,
}: AdminHeaderProps) {
  return (
    <header className="glass-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="label-brand">{subtitle}</p>
          <h1 className="text-display text-2xl font-bold tracking-tight text-surface-100">{title}</h1>
        </div>
        <nav className="flex items-center gap-3">
          {actions}
          <Link to="/" className={navLinkClass}>
            Reader App
          </Link>
        </nav>
      </div>
    </header>
  );
}
