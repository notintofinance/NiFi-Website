"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useLang } from "./Lang";

// Site-wide motion preference. Starts from the device setting
// (prefers-reduced-motion), can be switched by the visitor, and is mirrored
// to <html data-motion="reduced|full"> so plain CSS can react to it too.
// `locked` means the device asks for reduced motion, which always wins.
const MotionContext = createContext({ reduced: false, locked: false, ready: false, toggle: () => {} });

export function MotionProvider({ children }) {
  const [state, setState] = useState({ reduced: false, locked: false, ready: false });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => {
      let saved = null;
      try {
        saved = window.localStorage.getItem("nifi-motion");
      } catch {}
      setState({ reduced: mq.matches || saved === "reduced", locked: mq.matches, ready: true });
    };
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  useEffect(() => {
    if (state.ready) {
      document.documentElement.dataset.motion = state.reduced ? "reduced" : "full";
    }
  }, [state.reduced, state.ready]);

  const toggle = useCallback(() => {
    setState((s) => {
      if (s.locked) return s;
      const reduced = !s.reduced;
      try {
        window.localStorage.setItem("nifi-motion", reduced ? "reduced" : "full");
      } catch {}
      return { ...s, reduced };
    });
  }, []);

  return (
    <MotionContext.Provider value={{ ...state, toggle }}>{children}</MotionContext.Provider>
  );
}

export const useMotion = () => useContext(MotionContext);

export function MotionToggle({ className = "" }) {
  const { reduced, locked, toggle } = useMotion();
  const { t } = useLang();

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={locked}
      title={locked ? t.hero.motionLocked : undefined}
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-medium text-slate-300 transition-colors hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {reduced ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      {reduced ? t.hero.motionMore : t.hero.motionLess}
    </button>
  );
}
