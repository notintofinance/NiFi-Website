"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, ArrowUpRight } from "lucide-react";
import PreviewModal from "./PreviewModal";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// X logo (current mark).
function XLogo({ size = 14 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Article card — click opens a quick preview; the modal links out to X.
export default function ArticleCard({ title, date, summary, url, cover }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        href={url}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.button === 1) return;
          e.preventDefault();
          setOpen(true);
        }}
        className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-navy-600/60 bg-navy-700/40 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
          {cover ? (
            <Image
              src={cover}
              alt={`${title} — preview`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-600">
              No preview
            </div>
          )}

          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-navy-950/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <XLogo size={12} />
            Article
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <span className="mb-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar size={13} />
            {formatDate(date)}
          </span>
          <h3 className="text-base font-semibold leading-snug text-white transition-colors group-hover:text-accent-bright">
            {title}
          </h3>
          {summary && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
              {summary}
            </p>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-bright">
            Preview
            <ArrowUpRight size={15} />
          </span>
        </div>
      </a>

      <PreviewModal
        open={open}
        onClose={() => setOpen(false)}
        cover={cover}
        badge="Article"
        date={date}
        title={title}
        summary={summary}
        href={url}
        ctaLabel="Read on X"
      />
    </>
  );
}
