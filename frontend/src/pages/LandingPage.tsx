import { useEffect, useState } from "react";
import { MarketingLayout } from "../components/layout/MarketingLayout";
import { ClosingCTA } from "../components/landing/ClosingCTA";
import { FeaturedBooks } from "../components/landing/FeaturedBooks";
import { HeroSection } from "../components/landing/HeroSection";
import { HowItWorks } from "../components/landing/HowItWorks";
import { ReaderExperience } from "../components/landing/ReaderExperience";
import { SubscribeSection } from "../components/landing/SubscribeSection";
import { Book, fetchBooks } from "../lib/api";

export default function LandingPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks()
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MarketingLayout>
      <HeroSection books={books} loading={loading} />
      <FeaturedBooks books={books} loading={loading} />
      <HowItWorks />
      <ReaderExperience />
      <SubscribeSection />
      <ClosingCTA />
    </MarketingLayout>
  );
}
