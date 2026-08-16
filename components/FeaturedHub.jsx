import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ContentCard from "./ContentCard";
import { getAllContent } from "@/lib/content";

// Latest items across every hub content type (research, articles, newsletter,
// carousels) — replaces the separate FeaturedResearch / FeaturedArticles
// sections now that the hub unifies all four.
export default function FeaturedHub() {
  const latest = getAllContent().slice(0, 6);

  if (latest.length === 0) return null;

  return (
    <section id="hub" className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          align="left"
          number="04"
          eyebrow="The Hub"
          title="Fresh from the hub"
          subtitle="Research, articles, newsletter issues, and carousels — all in one place, free to read."
        />
        <Link
          href="/hub"
          className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-navy-600 bg-navy-800/60 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-accent hover:text-white"
        >
          View the hub
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {latest.map((item) => (
          <ContentCard key={item._id} {...item} />
        ))}
      </div>
    </section>
  );
}
