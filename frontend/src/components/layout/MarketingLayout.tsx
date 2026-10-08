import { ReactNode } from "react";
import { Footer } from "./Footer";
import { MarketingNav } from "./MarketingNav";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mesh-bg min-h-screen bg-app-gradient text-surface-100">
      <MarketingNav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
