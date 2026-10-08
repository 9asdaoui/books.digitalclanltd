const steps = [
  {
    num: "01",
    title: "Browse the catalog",
    body: "Explore curated fiction, business, and more. Every title has a detail page with full metadata before you commit.",
  },
  {
    num: "02",
    title: "Read the preview",
    body: "Start with free preview pages — no account required. Experience the reader, typography, and flow firsthand.",
  },
  {
    num: "03",
    title: "Unlock with membership",
    body: "Subscribe once for unlimited access to every published book. Cancel anytime through PayPal.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-white/10 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="landing-label">How it works</p>
        <h2 className="text-display mt-3 max-w-xl text-3xl font-bold text-surface-100 md:text-4xl">
          From discovery to deep reading in three steps
        </h2>
        <div className="landing-rule mt-8 max-w-xs" />

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <li key={step.num} className="relative">
              <span className="landing-step-num">{step.num}</span>
              <h3 className="text-display mt-4 text-lg font-semibold text-surface-100">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-surface-400">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
