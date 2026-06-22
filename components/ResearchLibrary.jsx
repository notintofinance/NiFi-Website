import SectionHeading from "./SectionHeading";
import ResearchCard from "./ResearchCard";
import { getReportsByDate } from "@/data/research-data";

export default function ResearchLibrary() {
  // Newest reports first. Edit the list in /data/research-data.js.
  const reports = getReportsByDate();

  return (
    <section id="research" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading
        eyebrow="Research Library"
        title="A look at our research"
        subtitle="A few reports you can read for free. Clear write-ups on the companies and sectors we've been looking into."
      />

      {reports.length > 0 ? (
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ResearchCard key={report.id} {...report} />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-slate-500">
          New research is on the way. Please check back soon.
        </p>
      )}
    </section>
  );
}
