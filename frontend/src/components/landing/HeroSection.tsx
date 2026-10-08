import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Book } from "../../lib/api";
import { Button } from "../ui/Button";

type HeroSectionProps = {
  books: Book[];
  loading: boolean;
};

export function HeroSection({ books, loading }: HeroSectionProps) {
  const featured = books.slice(0, 3);

  return (
    <section className="landing-grain relative overflow-hidden px-6 pb-20 pt-12 md:pb-28 md:pt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="landing-label landing-stagger landing-stagger-1">Digital Clan Books</p>
          <div className="landing-rule-left landing-stagger landing-stagger-2 mt-4" />
          <h1 className="landing-hero-serif landing-stagger landing-stagger-2 mt-8 text-4xl font-medium leading-[1.12] text-surface-50 md:text-5xl lg:text-[3.25rem]">
            A home for
            <br />
            serious reading.
          </h1>
          <p className="landing-stagger landing-stagger-3 mt-6 max-w-lg text-base leading-relaxed text-surface-400 md:text-lg">
            Curated eBooks in a reader built for focus — preview every title for free, then unlock
            the full library with one membership.
          </p>
          <div className="landing-stagger landing-stagger-4 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/store">
              <Button size="lg" className="min-w-[200px] gap-2">
                Browse the store <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                Create free account
              </Button>
            </Link>
          </div>
          {!loading && books.length > 0 && (
            <p className="mt-6 text-sm text-surface-500">
              {books.length} {books.length === 1 ? "title" : "titles"} in the catalog today
            </p>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          {!loading && featured.length > 0 ? (
            <div className="relative flex min-h-[340px] items-center justify-center md:min-h-[420px]">
              {featured.map((book, i) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="landing-cover-shadow absolute overflow-hidden rounded-lg transition-transform duration-500 hover:z-20 hover:scale-[1.03]"
                  style={{
                    width: i === 1 ? "52%" : "44%",
                    aspectRatio: "3/4",
                    transform: `rotate(${i === 0 ? -7 : i === 2 ? 7 : 0}deg) translateX(${(i - 1) * 28}%) translateY(${i === 1 ? -8 : i === 0 ? 12 : 16}px)`,
                    zIndex: i === 1 ? 3 : i === 0 ? 2 : 1,
                  }}
                >
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-surface-800 text-surface-500">
                      {book.title.charAt(0)}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[340px] items-center justify-center rounded-2xl border border-white/10 bg-surface-900/40">
              <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
