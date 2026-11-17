"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowUpRight, CornerDownLeft, Search, X } from "lucide-react";
import { buildIndex, search } from "@/data/search-index";
import { useLang } from "./Lang";

// "Cari di NiFi": one box that finds terms, research, primers, classes and
// places on the site. It is plain text matching over the site's own content
// (no AI, nothing sent anywhere).
//
// Keyboard: ↑/↓ move, Enter opens, Esc closes. The input keeps focus and the
// highlighted row is exposed through aria-activedescendant (combobox pattern).

const HUE = {
  blue: "bg-play-blue",
  violet: "bg-play-violet",
  pink: "bg-play-pink",
  cyan: "bg-play-cyan",
};

export default function CommandPalette({ open, initialQuery = "", onClose }) {
  const { lang, t } = useLang();
  const p = t.palette;
  const index = useMemo(() => buildIndex(lang), [lang]);
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const input = useRef(null);
  const list = useRef(null);

  // Reset each time it opens; lock page scroll; restore focus on close.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    setQuery(initialQuery);
    setActive(0);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => input.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, initialQuery]);

  const result = useMemo(() => search(index, query), [index, query]);
  const empty = query.trim() === "";
  const rows = empty ? index.suggestions : result.entries;
  const shownTerms = empty ? [] : result.terms.slice(0, 3);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    list.current?.querySelector(`[data-row="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (rows.length ? (a + 1) % rows.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (rows.length ? (a - 1 + rows.length) % rows.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      list.current?.querySelector(`[data-row="${active}"]`)?.click();
    } else if (e.key === "Tab") {
      e.preventDefault(); // focus stays in the dialog
    }
  };

  // Group rows for display while keeping one flat index for the keyboard.
  const groups = [];
  rows.forEach((row, index) => {
    const last = groups[groups.length - 1];
    if (last && last.name === row.group) last.items.push({ row, index });
    else groups.push({ name: row.group, items: [{ row, index }] });
  });

  // Rendered on <body>: the navbar's backdrop blur would otherwise trap a
  // fixed overlay inside the bar.
  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-ink-950/75 px-4 pt-[10vh] backdrop-blur-sm sm:pt-[14vh]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={p.title}
        className="pop flex max-h-[76vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-ink-900 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search size={18} className="flex-none text-slate-400" aria-hidden="true" />
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={rows.length ? `palette-row-${active}` : undefined}
            aria-autocomplete="list"
            aria-label={p.inputLabel}
            placeholder={p.placeholder}
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={p.close}
            className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-slate-400 hover:text-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div ref={list} className="scroll-quiet min-h-0 flex-1 overflow-y-auto p-2">
          {/* Instant answer: matching terms in plain language */}
          {shownTerms.length > 0 && (
            <div className="mb-2 space-y-2 p-2">
              {shownTerms.map((t) => (
                <div key={t.term} className="rounded-xl border border-white/10 bg-ink-800 p-4">
                  <p className="micro flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${HUE[t.hue]}`} aria-hidden="true" />
                    {p.term}
                  </p>
                  <p className="mt-2 font-display text-lg font-bold tracking-tight text-white">
                    {t.term}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">{t.meaning}</p>
                </div>
              ))}
            </div>
          )}

          {empty && (
            <div className="px-3 pb-2 pt-2">
              <p className="micro">{p.tryTerms}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {index.terms.map((t) => (
                  <button
                    key={t.term}
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                      setQuery(t.term);
                      input.current?.focus();
                    }}
                    className="inline-flex min-h-[36px] items-center rounded-full border border-white/[0.12] px-3 text-xs font-medium text-slate-300 transition-colors hover:border-white/40 hover:text-white"
                  >
                    {t.term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div id="palette-list" role="listbox" aria-label={p.results}>
            {groups.map((g) => (
              <div key={g.name} role="group" aria-label={g.name}>
                <p className="micro px-3 pb-1 pt-3">{g.name}</p>
                {g.items.map(({ row, index }) => {
                  const isActive = index === active;
                  const cls = `flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    isActive ? "bg-white/[0.08]" : ""
                  }`;
                  const body = (
                    <>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">
                          {row.title}
                        </span>
                        <span className="block truncate text-xs text-slate-400">{row.sub}</span>
                      </span>
                      {row.tag && (
                        <span className="hidden flex-none font-mono text-[10px] uppercase tracking-wider text-slate-400 sm:block">
                          {row.tag}
                        </span>
                      )}
                      {row.external ? (
                        <ArrowUpRight size={15} className="flex-none text-slate-400" aria-hidden="true" />
                      ) : (
                        isActive && (
                          <CornerDownLeft size={14} className="flex-none text-slate-400" aria-hidden="true" />
                        )
                      )}
                    </>
                  );
                  const common = {
                    id: `palette-row-${index}`,
                    role: "option",
                    "aria-selected": isActive,
                    "data-row": index,
                    tabIndex: -1,
                    onMouseMove: () => setActive(index),
                    className: cls,
                  };
                  const choose = () => {
                    if (row.primer) {
                      window.dispatchEvent(new CustomEvent("nifi:primer", { detail: row.primer }));
                    }
                    onClose();
                  };
                  return row.external || row.href.startsWith("mailto:") ? (
                    <a
                      key={row.id}
                      href={row.href}
                      target={row.external ? "_blank" : undefined}
                      rel={row.external ? "noopener noreferrer" : undefined}
                      onClick={choose}
                      {...common}
                    >
                      {body}
                    </a>
                  ) : (
                    <Link key={row.id} href={row.href} onClick={choose} {...common}>
                      {body}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {!empty && rows.length === 0 && shownTerms.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-400">
              {p.none(query)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-2.5 text-xs text-slate-400">
          <span className="hidden items-center gap-3 sm:flex">
            <span className="flex items-center gap-1.5">
              <kbd className="kbd">↑</kbd>
              <kbd className="kbd">↓</kbd> {p.pick}
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="kbd">↵</kbd> {p.open}
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="kbd">esc</kbd> {p.shut}
            </span>
          </span>
          <span>{p.note}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
