"use client";

import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LayoutGrid } from "lucide-react";
import HeroPoster from "./HeroPoster";
import { MotionToggle, useMotion } from "@/components/Motion";
import { useLang } from "@/components/Lang";
import { getJargon } from "@/data/home-data";

// The 3D bundle loads after the page is readable; the poster covers the wait.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => null });

// If the scene throws (lost context, unsupported GPU…), fall back to the poster.
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function PlaygroundStage() {
  const { reduced, ready } = useMotion();
  const { lang, t } = useLang();
  const jargon = useMemo(() => getJargon(lang), [lang]);
  const [webgl, setWebgl] = useState(null);
  const [failed, setFailed] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [tidy, setTidy] = useState(false);
  const [revealed, setRevealed] = useState(null);

  const wrap = useRef(null);
  const target = useRef(0); // 0 scattered … 1 tidy, read by the scene each frame
  const scroll = useRef(0);
  const tidyRef = useRef(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(Boolean(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  // Scrolling tidies the cards. Progress follows the stage's own position on
  // screen (not the page offset), so it works whether the stage sits beside
  // the headline (desktop) or below it (mobile): the scatter holds while the
  // stage is in the lower/middle of the viewport, and resolves into the grid
  // as it travels up.
  useEffect(() => {
    const onScroll = () => {
      const el = wrap.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const range = Math.min(vh * 0.38, rect.height * 0.55);
      scroll.current = Math.min(1, Math.max(0, (vh * 0.42 - center) / range));
      target.current = Math.max(scroll.current, tidyRef.current ? 1 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    tidyRef.current = tidy;
    target.current = Math.max(scroll.current, tidy ? 1 : 0);
  }, [tidy]);

  // Stop rendering frames while the hero is off screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const use3d = ready && webgl === true && !reduced && !failed;
  useEffect(() => {
    if (!use3d) setSceneReady(false);
  }, [use3d]);

  const onReady = useCallback(() => setSceneReady(true), []);
  const onFail = useCallback(() => setFailed(true), []);
  const item = revealed != null ? jargon[revealed] : null;

  return (
    <div>
      <div ref={wrap} className="relative h-[400px] sm:h-[470px] lg:h-[560px]">
        {use3d && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              sceneReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <SceneBoundary onFail={onFail}>
              <HeroScene
                items={jargon}
                label={t.hero.cardLabel}
                target={target}
                running={inView}
                onReveal={setRevealed}
                onReady={onReady}
              />
            </SceneBoundary>
          </div>
        )}
        {!(use3d && sceneReady) && (
          <div className="absolute inset-0">
            <HeroPoster items={jargon} tidy={tidy} revealed={revealed} onReveal={setRevealed} />
          </div>
        )}
      </div>

      {/* The revealed meaning, as real text (readable at any size, announced
          to screen readers). */}
      <p
        aria-live="polite"
        className="mt-4 min-h-[3.5rem] text-sm leading-relaxed text-slate-400 sm:min-h-[2.75rem]"
      >
        {item ? (
          <>
            <strong className="font-semibold text-white">{item.term}</strong>
            {" · "}
            {item.meaning}
          </>
        ) : (
          t.hero.stageHint
        )}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={tidy}
          onClick={() => setTidy((t) => !t)}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-xs font-medium transition-colors ${
            tidy
              ? "border-cool/60 bg-cool/10 text-white"
              : "border-white/15 text-slate-300 hover:border-white/40 hover:text-white"
          }`}
        >
          <LayoutGrid size={14} aria-hidden="true" />
          {t.hero.tidy}
        </button>
        <MotionToggle />
      </div>

      {/* With the 3D scene (a canvas), offer the same content as a list. */}
      {use3d && sceneReady && (
        <dl className="sr-only">
          {jargon.map((j) => (
            <div key={j.term}>
              <dt>{j.term}</dt>
              <dd>{j.meaning}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
