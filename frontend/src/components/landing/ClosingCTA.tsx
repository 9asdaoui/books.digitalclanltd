import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export function ClosingCTA() {
  return (
    <section className="border-t border-white/10 px-6 py-20 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="landing-rule mx-auto max-w-xs" />
        <h2 className="landing-hero-serif mt-10 text-3xl font-medium text-surface-50 md:text-4xl">
          Open a book tonight.
        </h2>
        <p className="mt-4 text-surface-400">
          Your next chapter is already in the catalog.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/store">
            <Button size="lg">Explore the store</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
