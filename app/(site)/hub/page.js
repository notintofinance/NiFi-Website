import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import { getAllContent } from "@/lib/content";

export const metadata = {
  title: "The Hub | Not Into Finance (NiFi)",
  description:
    "Every free report, article, newsletter issue, and carousel from Not Into Finance, in one place.",
};

export default function HubPage() {
  const items = getAllContent();

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <span className="eyebrow">The Hub</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Everything we publish, in one place
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Research, articles, newsletter issues, and carousels — filter by
              type or by topic to find what you're after.
            </p>
          </div>
        </section>

        <ContentGrid items={items} searchPlaceholder="Search the hub…" />
      </main>
      <Footer />
    </>
  );
}
