import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllAnalysts } from "@/lib/content";

export const metadata = {
  title: "Analysts | Not Into Finance (NiFi)",
  description: "The people behind our research reports.",
};

export default function AnalystIndexPage() {
  const analysts = getAllAnalysts();

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <span className="eyebrow">Analysts</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Who writes this
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Every research report has a byline. Here's everything each
              analyst has written.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {analysts.map((analyst) => (
              <Link
                key={analyst.slug}
                href={`/analyst/${analyst.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-navy-600/60 bg-navy-700/40 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60"
              >
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
                  <User size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white transition-colors group-hover:text-accent-bright">
                    {analyst.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {analyst.reportCount}{" "}
                    {analyst.reportCount === 1 ? "report" : "reports"}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-accent-bright"
                />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
