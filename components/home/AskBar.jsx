"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useMotion } from "@/components/Motion";
import { useLang } from "@/components/Lang";

// The hero's "try it now" box. It opens the site search (components/
// CommandPalette.jsx, hosted by the navbar) through a window event; the
// chips open it with a ready-made query. The typing text is decoration.
const openSearch = (query = "") =>
  window.dispatchEvent(new CustomEvent("nifi:search", { detail: query }));

function useTyped(phrases, enabled) {
  const [text, setText] = useState(phrases[0]);

  useEffect(() => {
    setText(phrases[0]);
    if (!enabled) return;
    let phrase = 0;
    let len = phrases[0].length;
    let dir = -1; // start by erasing the first phrase after a pause
    let timer;
    const tick = () => {
      len += dir;
      if (len <= 0) {
        phrase = (phrase + 1) % phrases.length;
        dir = 1;
        len = 0;
      }
      setText(phrases[phrase].slice(0, len));
      const done = dir === 1 && len >= phrases[phrase].length;
      if (done) dir = -1;
      timer = setTimeout(tick, done ? 2200 : dir === 1 ? 55 : 28);
    };
    timer = setTimeout(tick, 2400);
    return () => clearTimeout(timer);
  }, [phrases, enabled]);

  return text;
}

export default function AskBar() {
  const { reduced, ready } = useMotion();
  const { t } = useLang();
  const typed = useTyped(t.hero.askExamples, ready && !reduced);

  return (
    <div>
      <button
        type="button"
        onClick={() => openSearch()}
        aria-haspopup="dialog"
        aria-label={t.hero.askLabel}
        className="group flex min-h-[60px] w-full items-center gap-3 rounded-2xl border border-white/15 bg-ink-900 px-4 text-left shadow-[0_0_0_1px_rgba(143,174,255,0)] transition-[border-color,box-shadow] hover:border-cool/60 hover:shadow-[0_0_0_4px_rgba(143,174,255,0.12)]"
      >
        <Search size={18} className="flex-none text-slate-400" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-base text-slate-300" aria-hidden="true">
          {typed}
          {ready && !reduced && <span className="caret" />}
        </span>
        <kbd className="kbd hidden sm:inline-flex" aria-hidden="true">
          ⌘K
        </kbd>
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="micro mr-1">{t.hero.askTry}</span>
        {t.hero.askChips.map((c) => (
          <button
            key={c.query}
            type="button"
            onClick={() => openSearch(c.query)}
            aria-haspopup="dialog"
            className="inline-flex min-h-[36px] items-center rounded-full border border-white/[0.12] px-3 text-xs font-medium text-slate-300 transition-colors hover:border-white/40 hover:text-white"
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
