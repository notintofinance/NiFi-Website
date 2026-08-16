import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import { getContentByType } from "@/lib/content";

export const metadata = {
  title: "Newsletter | Not Into Finance (NiFi)",
  description:
    "The Not Into Finance newsletter archive — plain-language research and market takes, straight to your inbox.",
};

export default function NewsletterPage() {
  const issues = getContentByType("newsletterIssue");

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <span className="eyebrow">Newsletter</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              The newsletter archive
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Every issue we've sent, browsable in one place. Each one opens
              the full issue on Beehiiv.
            </p>
          </div>
        </section>

        <ContentGrid items={issues} searchPlaceholder="Search issues…" />
      </main>
      <Footer />
    </>
  );
}
