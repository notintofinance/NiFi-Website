import Image from "next/image";
import { Calendar, ArrowUpRight } from "lucide-react";

// Formats an ISO date string ("2026-05-28") into "May 28, 2026".
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Reusable card for a single research report — leads with the cover slide.
export default function ResearchCard({ title, category, date, summary, file, cover }) {
  return (
    <a
      href={file}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy-600/60 bg-navy-700/40 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60"
    >
      {/* Cover-slide preview */}
      <div className="relative aspect-[3/4] overflow-hidden bg-navy-900">
        {cover ? (
          <Image
            src={cover}
            alt={`${title} — cover`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            No preview
          </div>
        )}

        {/* Category badge */}
        <span className="absolute left-3 top-3 inline-flex items-center rounded-md bg-navy-950/70 px-2.5 py-1 text-xs font-semibold text-accent-bright backdrop-blur-sm">
          {category}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-950/90 via-navy-950/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="m-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white">
            Read report
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar size={13} />
          {formatDate(date)}
        </span>
        <h3 className="text-base font-semibold leading-snug text-white transition-colors group-hover:text-accent-bright">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {summary}
        </p>
      </div>
    </a>
  );
}
