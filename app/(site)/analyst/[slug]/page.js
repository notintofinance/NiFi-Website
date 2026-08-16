import Link from "next/link";
import { notFound } from "next/navigation";
import { User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";
import { getAllAnalysts, getAnalystBySlug } from "@/lib/content";

export function generateStaticParams() {
  return getAllAnalysts().map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }) {
  const analyst = getAnalystBySlug(params.slug);
  if (!analyst) return {};
  return {
    title: `${analyst.name} | Not Into Finance (NiFi)`,
    description: `Research reports by ${analyst.name}.`,
  };
}

export default function AnalystPage({ params }) {
  const analyst = getAnalystBySlug(params.slug);
  if (!analyst) notFound();

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent-bright">
              <User size={26} strokeWidth={2} />
            </div>
            <span className="eyebrow">Analyst</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {analyst.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              {analyst.reportCount}{" "}
              {analyst.reportCount === 1 ? "report" : "reports"} in the
              research library.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {analyst.reports.map((item) => (
              <ContentCard key={item._id} {...item} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 text-center">
          <Link
            href="/analyst"
            className="text-sm font-semibold text-accent-bright hover:text-white"
          >
            ← All analysts
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
