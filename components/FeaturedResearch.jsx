import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ResearchCard from "./ResearchCard";
import { getReportsByDate } from "@/data/research-data";

export default function FeaturedResearch() {
  // Show the three newest reports as a preview; full list lives at /research.
  const latest = getReportsByDate().slice(0, 3);

  return (
    <section id="research" className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          align="left"
          eyebrow="Research"
          title="A look at our latest research"
          subtitle="Free reports you can actually read, on the companies and sectors we've been looking into."
        />
        <Link
          href="/research"
          className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-navy-600 bg-navy-800/60 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-accent hover:text-white"
        >
          View all research
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {latest.map((report) => (
          <ResearchCard key={report.id} {...report} />
        ))}
      </div>
    </section>
  );
}
