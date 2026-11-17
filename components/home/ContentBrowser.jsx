"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, FileText, Search } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { useLang } from "@/components/Lang";
import { shortDate } from "@/lib/format";

// Research explorer: an app-like window with topic filters, a text filter,
// a list of every item, and a preview of the one in focus. On wide screens
// the preview sits beside the list (hover or focus a row to preview it); on
// small screens the chosen row opens in place.
// `items` is built on the server from the real data files.

const TOPIC_TINT = {
  stocks: "from-play-blue/[0.35]",
  commodities: "from-play-cyan/30",
  energy: "from-play-pink/30",
  macro: "from-play-violet/[0.35]",
  other: "from-slate-500/30",
};

function Detail({ item }) {
  const { lang, t } = useLang();
  const R = t.research;
  const riset = item.type === "research";
  const topicNames = item.topics.map((k) => R.topics[k]);
  return (
    <div>
      <div
        className={`relative flex h-40 items-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${
          TOPIC_TINT[item.topics[0]] ?? TOPIC_TINT.other
        } via-ink-800 to-ink-900 sm:h-48`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-5 left-5 select-none font-display text-[5.5rem] font-extrabold leading-none tracking-tighter text-white/[0.09] sm:text-[7rem]"
        >
          {topicNames[0]}
        </span>
        {item.cover ? (
          <Image
            src={item.cover}
            alt=""
            width={707}
            height={1000}
            sizes="140px"
            className="absolute right-7 top-6 w-[118px] rotate-6 rounded-md border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.6)] sm:w-[136px]"
          />
        ) : (
          <span className="micro absolute right-5 top-5 rounded-full border border-white/15 bg-ink-950/70 px-3 py-1.5">
            {R.onX}
          </span>
        )}
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
        <span
          className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em] ${
            riset ? "text-cool" : "text-slate-200"
          }`}
        >
          {riset && <FileText size={12} aria-hidden="true" />}
          {R.types[item.type]}
        </span>
        <span>{topicNames.join(" · ")}</span>
        <time dateTime={item.date}>{shortDate(item.date, lang)}</time>
      </p>
      <p className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-white">
        {item.title}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{item.summary[lang]}</p>
      <a href={item.href} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6">
        {riset ? R.readReport : R.readOnX}
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </div>
  );
}

export default function ContentBrowser({ items, topics }) {
  const { lang, t } = useLang();
  const R = t.research;
  const [topic, setTopic] = useState("all");
  const [text, setText] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    return items.filter(
      (i) =>
        (topic === "all" || i.topics.includes(topic)) &&
        (!q || `${i.title} ${i.summary[lang]}`.toLowerCase().includes(q))
    );
  }, [items, topic, text, lang]);

  // Wide screens always preview something; small screens open on demand.
  const current = filtered.find((i) => i.id === selected) ?? filtered[0];

  const onRowClick = (id) => {
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    setSelected((s) => (s === id && !wide ? null : id));
  };

  return (
    <div className="win">
      <div className="win-bar">
        <span className="win-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="micro">{R.window}</span>
        <span aria-live="polite" className="micro ml-auto normal-case tracking-normal">
          {R.count(filtered.length, items.length)}
        </span>
      </div>

      <div className="flex flex-col gap-3 border-b border-white/[0.08] p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={R.filter} className="flex flex-wrap gap-2">
          {["all", ...topics].map((k) => (
            <button key={k} type="button" aria-pressed={topic === k} onClick={() => setTopic(k)} className="chip">
              {k === "all" ? R.all : R.topics[k]}
            </button>
          ))}
        </div>
        <label className="flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 focus-within:border-cool lg:w-64">
          <Search size={15} className="flex-none text-slate-400" aria-hidden="true" />
          <span className="sr-only">{R.filterLabel}</span>
          <input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={R.filterPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="font-display text-xl font-bold text-white">{R.emptyTitle}</p>
          <p className="mt-2 text-sm text-slate-400">{R.emptyBody}</p>
          <button
            type="button"
            onClick={() => {
              setTopic("all");
              setText("");
            }}
            className="btn-secondary mt-6"
          >
            {R.showAll}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <ul className="scroll-quiet lg:max-h-[560px] lg:overflow-y-auto lg:border-r lg:border-white/[0.08]">
            {filtered.map((item) => {
              const isCurrent = current?.id === item.id;
              const isOpen = selected === item.id;
              return (
                <li key={item.id} className="border-b border-white/[0.06] last:border-b-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`content-${item.id}`}
                    onClick={() => onRowClick(item.id)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(item.id)}
                    onFocus={() => {
                      if (window.matchMedia("(min-width: 1024px)").matches) setSelected(item.id);
                    }}
                    className={`relative flex min-h-[64px] w-full items-center gap-4 px-4 py-3 text-left transition-colors focus-visible:-outline-offset-2 sm:px-5 ${
                      isCurrent ? "lg:bg-white/[0.05]" : ""
                    } ${isOpen ? "max-lg:bg-white/[0.05]" : ""}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-0 left-0 hidden w-0.5 bg-cool lg:block ${
                        isCurrent ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span
                      className={`w-14 flex-none font-mono text-[10px] font-medium uppercase tracking-wider ${
                        item.type === "research" ? "text-cool" : "text-slate-400"
                      }`}
                    >
                      {R.types[item.type]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-snug text-white">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {item.topics.map((k) => R.topics[k]).join(" · ")} · {shortDate(item.date, lang)}
                      </span>
                    </span>
                  </button>
                  <div id={`content-${item.id}`} hidden={!isOpen} className="px-4 pb-6 pt-2 sm:px-5 lg:!hidden">
                    <Detail item={item} />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="hidden p-7 lg:block">
            {current && (
              <div key={current.id} className="pop">
                <Detail item={current} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* The site shows a selection; the full library lives on Arthara. */}
      <div className="flex flex-col gap-4 border-t border-white/[0.08] bg-ink-800/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-white/10 bg-ink-900">
            <Image src="/arthara-mark.png" alt="" width={28} height={28} className="h-6 w-6 object-contain invert" />
          </span>
          <p className="text-sm leading-relaxed text-slate-300">
            <strong className="font-semibold text-white">{R.artharaLead}</strong>
            {R.artharaRest}
          </p>
        </div>
        <a href={siteConfig.links.arthara} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-none">
          {R.artharaCta}
          <ArrowUpRight size={15} className="text-slate-400" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
