import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResearchGrid from "@/components/ResearchGrid";

export const metadata = {
  title: "Research | Not Into Finance (NiFi)",
  description:
    "Free, readable research reports on Indonesian companies and sectors, written in plain language by Not Into Finance.",
};

export default function ResearchPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Page header */}
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <span className="eyebrow">Research Library</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Research you can actually read
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Clear, independent write-ups on the companies and sectors we&apos;ve
              been digging into. Free to read, no jargon required.
            </p>
          </div>
        </section>

        <ResearchGrid />
      </main>
      <Footer />
    </>
  );
}
