export function ReaderExperience() {
  return (
    <section className="border-t border-white/10 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-surface-900/40 md:grid md:grid-cols-2">
          <div className="border-b border-white/10 p-8 md:border-b-0 md:border-r md:p-12">
            <p className="landing-label">The reader</p>
            <h2 className="landing-hero-serif mt-4 text-3xl font-medium leading-snug text-surface-50 md:text-4xl">
              Built for long sessions, not quick scrolls.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-surface-400 md:text-base">
              Serif typography, light and sepia themes, focus mode, keyboard navigation, and progress
              that follows you across devices. Install as a PWA and keep reading offline when you
              subscribe.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-surface-300">
              <li className="flex gap-3">
                <span className="text-accent-gold">—</span>
                Adjustable type size and three reading themes
              </li>
              <li className="flex gap-3">
                <span className="text-accent-gold">—</span>
                Secure streaming — no raw file downloads
              </li>
              <li className="flex gap-3">
                <span className="text-accent-gold">—</span>
                Offline library via progressive web app
              </li>
            </ul>
          </div>
          <div className="relative flex min-h-[280px] items-center justify-center bg-surface-950/60 p-8">
            <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#faf8f5] p-6 shadow-2xl">
              <p className="text-reader text-sm leading-relaxed text-surface-800">
                The old sheriff leaned against the saloon door, watching the street with the patience
                of a man who had learned that trouble always arrived on its own schedule...
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-surface-300/40 pt-3 text-[10px] uppercase tracking-wider text-surface-500">
                <span>Page 12 of 110</span>
                <span>Sepia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
