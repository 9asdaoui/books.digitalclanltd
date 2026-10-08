import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../brand/BrandLogo";

const values = [
  {
    title: "Free previews",
    body: "Every title offers sample pages before you subscribe.",
  },
  {
    title: "Offline ready",
    body: "Install the app and keep reading without a connection.",
  },
  {
    title: "Secure delivery",
    body: "Books stream protected — never exposed as raw downloads.",
  },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="landing-grain relative hidden overflow-hidden bg-app-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <BrandLogo size="lg" />
        <div className="max-w-md">
          <p className="landing-label">Digital Clan Books</p>
          <div className="landing-rule-left mt-4" />
          <h2 className="landing-hero-serif mt-8 text-4xl font-medium leading-tight text-surface-50">
            Your library, wherever you are.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-surface-400">
            Sign in to sync progress, unlock subscriptions, and return to the reader you left open.
          </p>
          <ul className="mt-10 space-y-6 border-t border-white/10 pt-10">
            {values.map((item) => (
              <li key={item.title}>
                <p className="text-display text-sm font-semibold text-surface-200">{item.title}</p>
                <p className="mt-1 text-sm text-surface-500">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-surface-600">© Digital Clan Ltd</p>
      </div>
      <div className="flex items-center justify-center bg-surface-950 p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-block lg:hidden">
            <BrandLogo size="md" />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
