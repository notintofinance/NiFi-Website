"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Copy, GraduationCap, LineChart, Megaphone, Send } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { services } from "@/data/business-data";
import { businessShort } from "@/data/home-data";
import { useLang } from "@/components/Lang";

// For brands and organisations: choose one or more services on the left and
// an email to NiFi is drafted on the right. "Open in your email app" hands
// the draft to the visitor's own mail client (a mailto link), so nothing is
// collected or sent by the site itself. Full detail is on /for-business.

const ICONS = {
  "brand-placement": Megaphone,
  events: CalendarDays,
  academy: GraduationCap,
  arthara: LineChart,
};

export default function BusinessBlock() {
  const { lang, t } = useLang();
  const B = t.business;
  const [picked, setPicked] = useState(["brand-placement"]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const chosen = services.filter((s) => picked.includes(s.id)).map((s) => s.title);
  const subject = B.subjectLine(chosen.join(", "));
  const lines = B.bodyLines(chosen);
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(lines.join("\n"))}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.contactEmail);
      setCopied(true);
    } catch {}
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-cool-deep">
      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)]">
        {/* Choose */}
        <div className="p-7 sm:p-10">
          <p className="micro !text-slate-300">For Business</p>
          <h2 id="bisnis-title" className="mt-5 text-3xl leading-[1.1] sm:text-4xl">
            {B.title}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">{B.body}</p>

          <p className="micro mt-9 !text-slate-300">{B.choose}</p>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {services.map((s) => {
              const on = picked.includes(s.id);
              const Icon = ICONS[s.id];
              return (
                <li
                  key={s.id}
                  className={`relative rounded-2xl border transition-colors ${
                    on ? "border-cool bg-white/[0.08]" : "border-white/15 hover:border-white/40"
                  }`}
                >
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(s.id)}
                    className="block h-full w-full rounded-2xl p-4 pb-11 text-left"
                  >
                    <span className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${
                          on ? "border-cool/60 bg-cool/15 text-white" : "border-white/15 text-slate-300"
                        }`}
                      >
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span
                        aria-hidden="true"
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                          on ? "border-cool bg-cool text-ink-950" : "border-white/25"
                        }`}
                      >
                        {on && <Check size={12} strokeWidth={3} />}
                      </span>
                    </span>
                    <span className="mt-3 block font-display text-base font-bold tracking-tight text-white">
                      {s.title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-snug text-slate-300">
                      {businessShort[lang][s.id]}
                    </span>
                  </button>
                  <Link
                    href={`/for-business#${s.id}`}
                    aria-label={B.detailsOf(s.title)}
                    className="absolute bottom-2 left-4 inline-flex min-h-[32px] items-center gap-1 text-xs font-medium text-slate-300 underline-offset-4 hover:text-white hover:underline"
                  >
                    {B.details}
                    <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link href="/for-business" className="link-arrow mt-7 min-h-[44px]">
            {B.all}
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {/* Draft */}
        <div className="p-4 pt-0 sm:p-8 sm:pt-0 lg:py-10 lg:pl-0 lg:pr-10">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-950/70 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <div className="win-bar">
              <span className="win-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="micro">{B.compose}</span>
            </div>

            <dl className="text-sm">
              <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-2">
                <dt className="w-16 flex-none text-slate-400">{B.to}</dt>
                <dd className="min-w-0 flex-1 truncate text-white">{siteConfig.contactEmail}</dd>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={copied ? B.copied : B.copy}
                  className="inline-flex min-h-[36px] flex-none items-center gap-1.5 rounded-full border border-white/15 px-3 text-xs font-medium text-slate-300 transition-colors hover:border-white/40 hover:text-white"
                >
                  {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                  <span aria-live="polite" className="hidden sm:inline">
                    {copied ? B.copied : B.copy}
                  </span>
                </button>
              </div>
              <div className="flex items-baseline gap-3 border-b border-white/[0.08] px-5 py-3">
                <dt className="w-16 flex-none text-slate-400">{B.subject}</dt>
                <dd className="min-w-0 flex-1 font-medium text-white">{subject}</dd>
              </div>
            </dl>

            <p className="flex-1 whitespace-pre-wrap px-5 py-5 font-mono text-[13px] leading-relaxed text-slate-300">
              {lines.map((line, i) => (
                <span key={i} className={line.startsWith("- ") ? "text-white" : undefined}>
                  {line}
                  {"\n"}
                </span>
              ))}
            </p>

            <div className="border-t border-white/[0.08] p-4">
              <a href={mailto} className="btn-primary w-full">
                <Send size={15} aria-hidden="true" />
                {B.send}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
