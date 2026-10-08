import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export function SubscribeSection() {
  return (
    <section id="pricing" className="border-t border-white/10 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-7xl md:grid md:grid-cols-2 md:gap-16">
        <div>
          <p className="landing-label">Membership</p>
          <h2 className="landing-hero-serif mt-4 text-3xl font-medium text-surface-50 md:text-4xl">
            One plan. The whole library.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-surface-400 md:text-base">
            Preview any book before you join. When you are ready, a single subscription unlocks every
            published title — with PayPal billing you control.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-surface-900/50 p-8 md:mt-0">
          <p className="text-display text-5xl font-bold text-surface-50">
            $9.99
            <span className="ml-1 text-lg font-normal text-surface-500">/ month</span>
          </p>
          <div className="landing-rule-left mt-6" />
          <ul className="mt-6 space-y-2 text-sm text-surface-400">
            <li>Unlimited access to all published books</li>
            <li>Offline reading when installed as an app</li>
            <li>Cancel anytime through PayPal</li>
          </ul>
          <Link to="/signup" className="mt-8 block">
            <Button fullWidth size="lg">
              Start reading today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
