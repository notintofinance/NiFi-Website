"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ArrowUpRight, Calendar } from "lucide-react";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PreviewModal({
  open,
  onClose,
  cover,
  badge,
  date,
  title,
  summary,
  byline,
  href,
  ctaLabel,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-2xl border border-navy-600/60 bg-navy-800 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-950/60 text-slate-300 backdrop-blur-sm transition-colors hover:text-white"
        >
          <X size={18} />
        </button>

        {cover && (
          <div className="relative flex h-60 w-full items-center justify-center bg-navy-900">
            <Image
              src={cover}
              alt={title}
              fill
              sizes="512px"
              className="object-contain"
            />
          </div>
        )}

        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            {badge && (
              <span className="inline-flex items-center rounded-md bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-bright">
                {badge}
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar size={13} />
                {formatDate(date)}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-xl font-bold leading-snug text-white">
            {title}
          </h3>

          {byline && (
            <p className="mt-2 text-xs text-slate-500">By {byline}</p>
          )}

          {summary && (
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {summary}
            </p>
          )}

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-bright"
          >
            {ctaLabel}
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
