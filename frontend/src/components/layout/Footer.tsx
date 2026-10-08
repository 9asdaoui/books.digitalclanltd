import { Link } from "react-router-dom";
import { BrandLogo } from "../brand/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-950/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandLogo size="md" href="/" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-surface-400">
            A curated digital library for readers who care about craft — premium eBooks, thoughtful
            design, and reading that works offline.
          </p>
        </div>
        <div>
          <p className="label-brand mb-3">Product</p>
          <ul className="space-y-2 text-sm text-surface-400">
            <li><Link to="/store" className="hover:text-accent-gold">Book Store</Link></li>
            <li><Link to="/signup" className="hover:text-accent-gold">Create Account</Link></li>
            <li><Link to="/login" className="hover:text-accent-gold">Sign In</Link></li>
          </ul>
        </div>
        <div>
          <p className="label-brand mb-3">Company</p>
          <ul className="space-y-2 text-sm text-surface-400">
            <li>Digital Clan Ltd</li>
            <li><a href="mailto:hello@digitalclan.com" className="hover:text-accent-gold">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="landing-rule mx-auto max-w-7xl" />
      <div className="px-6 py-4 text-center text-xs text-surface-500">
        © {new Date().getFullYear()} Digital Clan Ltd. All rights reserved.
      </div>
    </footer>
  );
}
