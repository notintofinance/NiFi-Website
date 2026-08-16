import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TagChip from "./TagChip";

// The bottom row (tags + arrow) renders outside the card's <Link> — an <a>
// (TagChip/Link) can't be a descendant of another <a> in valid HTML.
export default function LearnCard({ id, title, summary, tags }) {
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-navy-600/60 bg-navy-700/40 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60">
      <Link href={`/learn/${id}`}>
        <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-accent-bright">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {summary}
        </p>
      </Link>

      <div className="mt-6 flex items-center justify-between">
        {tags?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagChip key={tag.slug} tag={tag} />
            ))}
          </div>
        ) : (
          <span />
        )}
        <ArrowRight
          size={18}
          aria-hidden="true"
          className="shrink-0 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-accent-bright"
        />
      </div>
    </div>
  );
}
