import { BrandLogo } from "../brand/BrandLogo";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import { cn } from "../../lib/cn";

const navLinks = [
  { to: "/store", label: "Store" },
  { to: "/#catalog", label: "Catalog" },
  { to: "/#pricing", label: "Membership" },
];

export function MarketingNav() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <BrandLogo size="md" />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "text-sm font-medium transition hover:text-accent-gold",
                location.pathname === link.to ? "text-accent-gold" : "text-surface-300",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <Link to="/account">
                <Button variant="secondary" size="sm">
                  {user.full_name || user.email.split("@")[0]}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button type="button" className="md:hidden text-surface-200" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-surface-300" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="secondary" fullWidth>
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)}>
                  <Button fullWidth>Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
