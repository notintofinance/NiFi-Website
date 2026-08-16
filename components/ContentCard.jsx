"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, ArrowUpRight, FileText, Mail, Images } from "lucide-react";
import PreviewModal from "./PreviewModal";
import TagChip from "./TagChip";

function XLogo({ size = 12 }) {
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

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// One card component for all four hub content types — research, article,
// newsletter, carousel — configured by `_type` instead of duplicating the
// card + preview-modal markup per type (they only differ in badge/aspect
// ratio/CTA copy).
const TYPE_CONFIG = {
  researchReport: {
    label: "Research",
    Icon: FileText,
    aspect: "aspect-[3/4]",
    ctaLabel: "Read the full research",
    showByline: true,
  },
  article: {
    label: "Article",
    Icon: XLogo,
    aspect: "aspect-[16/9]",
    ctaLabel: "Read on X",
    showByline: false,
  },
  newsletterIssue: {
    label: "Newsletter",
    Icon: Mail,
    aspect: "aspect-[16/9]",
    ctaLabel: "Read the issue",
    showByline: false,
  },
  carousel: {
    label: "Carousel",
    Icon: Images,
    aspect: "aspect-[4/5]",
    ctaLabel: "View the post",
    showByline: false,
  },
};

export default function ContentCard({
  _type,
  title,
  date,
  summary,
  brief,
  authors,
  cover,
  href,
  tags,
}) {
  const [open, setOpen] = useState(false);
  const config = TYPE_CONFIG[_type] ?? TYPE_CONFIG.article;
  const { label, Icon, aspect, ctaLabel, showByline } = config;
  const byline = showByline && authors?.length ? authors.join(", ") : null;

  return (
    <>
      {/* Tags render as a sibling <div>, not nested inside the card's <a> —
          an <a> (TagChip/Link) can't be a descendant of another <a> in valid
          HTML, and React will fail to hydrate if it is. */}
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-navy-600/60 bg-navy-700/40 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60">
        <a
          href={href}
          onClick={(e) => {
            // Plain click opens the preview; cmd/ctrl/middle-click opens the
            // link directly in a new tab.
            if (e.metaKey || e.ctrlKey || e.button === 1) return;
            e.preventDefault();
            setOpen(true);
          }}
          className="flex flex-1 cursor-pointer flex-col"
        >
          <div className={`relative ${aspect} overflow-hidden bg-navy-900`}>
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

            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-navy-950/70 px-2.5 py-1 text-xs font-semibold text-accent-bright backdrop-blur-sm">
              <Icon size={12} />
              {label}
            </span>

            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-950/90 via-navy-950/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="m-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white">
                Preview
                <ArrowUpRight size={16} />
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col px-5 pt-5 pb-3">
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
            {byline && (
              <p className="mt-3 line-clamp-1 text-xs text-slate-500">
                By {byline}
              </p>
            )}
          </div>
        </a>

        <div className="flex flex-wrap gap-1.5 px-5 pb-5">
          {tags?.map((tag) => (
            <TagChip key={tag.slug} tag={tag} />
          ))}
        </div>
      </div>

      <PreviewModal
        open={open}
        onClose={() => setOpen(false)}
        cover={cover}
        badge={label}
        date={date}
        title={title}
        summary={brief || summary}
        byline={byline}
        href={href}
        ctaLabel={ctaLabel}
      />
    </>
  );
}
