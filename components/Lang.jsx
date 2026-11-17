"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { copy, languages } from "@/data/copy";

// Site language: Indonesian by default, English on request. The choice is
// remembered on this device and mirrored to <html lang>. Components read the
// text for the current language with:  const { t, lang } = useLang();
const LangContext = createContext({ lang: "id", t: copy.id, setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("id");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("nifi-lang");
      if (saved === "en" || saved === "id") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      window.localStorage.setItem("nifi-lang", next);
    } catch {}
  }, []);

  return <LangContext.Provider value={{ lang, t: copy[lang], setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

// Two-way switch: ID | EN.
export function LangSwitch({ className = "", large = false }) {
  const { lang, t, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className={`inline-flex items-center rounded-full border border-white/15 p-0.5 ${className}`}
    >
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={lang === l.code}
          aria-label={l.name}
          onClick={() => setLang(l.code)}
          className={`inline-flex items-center justify-center rounded-full px-2 font-mono font-medium transition-colors ${
            large ? "h-11 min-w-[56px] text-sm" : "h-8 min-w-[36px] text-[11px]"
          } ${
            lang === l.code ? "bg-white text-ink-950" : "text-slate-400 hover:text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
