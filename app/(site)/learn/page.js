import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LearnCard from "@/components/LearnCard";
import { learnTopics } from "@/data/learn-data";

export const metadata = {
  title: "Learn | Not Into Finance (NiFi)",
  description:
    "Plain-language primers on investing, markets, risk, macro, and valuation — no finance degree required.",
};

export default function LearnPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <span className="eyebrow">Learn</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Start wherever you are
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Five short, plain-language primers — no jargon, no finance
              degree required. Start from the top if you're new, or jump
              straight to what you need.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {learnTopics.map((topic) => (
              <LearnCard key={topic.id} {...topic} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
