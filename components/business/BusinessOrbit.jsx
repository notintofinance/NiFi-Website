"use client";

import { Component, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Check, X } from "lucide-react";
import { useLang } from "@/components/Lang";
import { useMotion } from "@/components/Motion";
import { siteConfig } from "@/data/site-config";
import { businessCopy } from "@/data/business-copy";
import { businessUnits } from "@/data/business-data";

// The NiFi business ecosystem in the For Business hero: NiFi in the middle
// with NiFi Academy, NiFi Media and NiFi Research (with Arthara) in orbit.
//
// The orbit is a real-time 3D scene (OrbitScene.jsx) that loads after the
// page is readable. Until then, and whenever WebGL is missing, the scene
// fails or motion is reduced, a flat version with the same logos is shown.
// Pressing a unit, in the orbit or on the buttons under it, opens a short
// summary card with a picture; the buttons and the card work without the
// 3D scene and from the keyboard.

const Scene = dynamic(() => import("./OrbitScene"), { ssr: false, loading: () => null });

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

// Where each logo sits in the flat version (percent of the stage).
const FLAT = {
  research: { left: "50%", top: "83%" },
  academy: { left: "24%", top: "24%" },
  media: { left: "77%", top: "30%" },
};
const DOT = { academy: "bg-play-violet", media: "bg-play-pink", research: "bg-play-cyan" };

// With a unit selected on wide screens the system steps to the left and the
// unit stops front-left, clear of the card on the right. On small screens
// the card sits under the orbit, so the unit simply comes to the front.
const FOCUS_WIDE = { x: -1.75, scale: 0.76, turn: 0.72 };
const FOCUS_NARROW = { x: 0, scale: 1.04, turn: 0 };

function ArtharaTag() {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
      <Image src="/arthara-mark-white.png" alt="" width={512} height={484} className="h-6 w-auto flex-none" />
      Arthara
    </span>
  );
}

function UnitCard({ unit, text, labels, onClose, cardRef }) {
  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-labelledby="orbit-card-title"
      tabIndex={-1}
      className="pop overflow-hidden rounded-[1.5rem] border border-white/15 bg-ink-900/95 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur focus:outline-none"
    >
      <div className="relative">
        <Image
          src={unit.image.src}
          alt={text.alt}
          width={unit.image.w}
          height={unit.image.h}
          sizes="(max-width: 1024px) 100vw, 330px"
          className="aspect-[2/1] w-full object-cover object-top"
        />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-900 to-transparent" />
        <button
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          className="absolute right-2.5 top-2.5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-ink-950/80 text-white transition-colors hover:bg-ink-950"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>

      <div className="px-5 pb-3 pt-3">
        <h3 id="orbit-card-title" className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
          <Image src={unit.logo} alt={text.name} width={unit.w} height={unit.h} className="h-8 w-auto" />
          {unit.moon && (
            <>
              <span aria-hidden="true" className="h-6 w-px bg-white/20" />
              <ArtharaTag />
            </>
          )}
        </h3>
        <p className="micro mt-3.5 !text-cool">{text.kind}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">{text.summary}</p>
        <ul className="mt-3.5 space-y-1.5 border-t border-white/[0.08] pt-3.5">
          {text.points.map((point) => (
            <li key={point} className="flex gap-2.5 text-[13px] leading-snug text-slate-300">
              <Check size={15} className="mt-0.5 flex-none text-cool" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-2 flex flex-wrap gap-x-5">
          <a
            href={`#${unit.service}`}
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline"
          >
            {text.link}
            <ArrowDown size={14} aria-hidden="true" />
          </a>
          {unit.moon && (
            <a
              href={siteConfig.links.arthara}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline"
            >
              arthara.id
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
        </p>
      </div>
    </div>
  );
}

// The same system without 3D: rings, the NiFi mark, and each logo as a button.
function FlatOrbit({ texts, selected, onSelect, interactive }) {
  return (
    <div className="absolute inset-0" aria-hidden={interactive ? undefined : true}>
      {["46%", "68%", "90%"].map((size) => (
        <span
          key={size}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 aspect-[1/0.62] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-cool/25"
          style={{ width: size }}
        />
      ))}
      <span className="absolute left-1/2 top-1/2 inline-flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cool/40 bg-cool-deep shadow-[0_0_60px_rgba(143,174,255,0.35)]">
        <Image src="/nifi-mark-white.png" alt="" width={40} height={39} className="h-9 w-9" />
      </span>
      {businessUnits.map((unit) => (
        <button
          key={unit.id}
          type="button"
          tabIndex={interactive ? 0 : -1}
          aria-pressed={selected === unit.id}
          onClick={() => onSelect(unit.id)}
          style={FLAT[unit.id]}
          className={`absolute inline-flex min-h-[44px] -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-full border bg-ink-950/90 px-4 transition-colors ${
            selected === unit.id ? "border-white" : "border-white/25 hover:border-white/60"
          }`}
        >
          <Image src={unit.logo} alt={texts[unit.id].name} width={unit.w} height={unit.h} className="h-[22px] w-auto sm:h-6" />
          {unit.moon && (
            <Image src="/arthara-mark-white.png" alt="Arthara" width={512} height={484} className="h-5 w-auto flex-none" />
          )}
        </button>
      ))}
    </div>
  );
}

export default function BusinessOrbit() {
  const { lang } = useLang();
  const { reduced, ready } = useMotion();
  const O = businessCopy[lang].orbit;

  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [webgl, setWebgl] = useState(null);
  const [failed, setFailed] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [wide, setWide] = useState(true);
  const stage = useRef(null);
  const card = useRef(null);
  const chips = useRef({});
  const last = useRef(null);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(Boolean(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Render frames only while the orbit is near the screen.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "160px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const use3d = ready && webgl === true && !reduced && !failed;
  useEffect(() => {
    if (!use3d) setSceneReady(false);
  }, [use3d]);

  // Pressing the selected unit again closes its card.
  const select = useCallback((id) => setSelected((current) => (id != null && id !== current ? id : null)), []);
  const close = useCallback(() => setSelected(null), []);
  const onReady = useCallback(() => setSceneReady(true), []);
  const onFail = useCallback(() => setFailed(true), []);

  // Escape closes the card. Keyboard users land on the card when it opens
  // and go back to the button they came from when it closes.
  useEffect(() => {
    if (selected == null) {
      if (last.current && document.activeElement === document.body) chips.current[last.current]?.focus({ preventScroll: true });
      return;
    }
    last.current = selected;
    const fromButton = document.activeElement?.closest?.("[data-orbit-control]");
    if (fromButton) card.current?.focus({ preventScroll: true });
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      card.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const show3d = use3d && sceneReady;
  const unit = businessUnits.find((u) => u.id === selected);

  return (
    <section aria-label={O.label} className="relative">
      <div ref={stage} className="relative -mx-5 aspect-[6/5] sm:mx-0 lg:aspect-[11/10]">
        {/* Soft light behind the system */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cool/[0.07] blur-3xl"
        />
        {use3d && (
          <div className={`absolute inset-0 transition-opacity duration-700 ${sceneReady ? "opacity-100" : "opacity-0"}`}>
            <SceneBoundary onFail={onFail}>
              <Scene
                units={businessUnits}
                selected={selected}
                hovered={hovered}
                focus={wide ? FOCUS_WIDE : FOCUS_NARROW}
                running={inView}
                onSelect={select}
                onHover={setHovered}
                onReady={onReady}
              />
            </SceneBoundary>
          </div>
        )}
        {!show3d && <FlatOrbit texts={O.units} selected={selected} onSelect={select} interactive={!use3d} />}

        {/* Summary card: beside the orbit on wide screens */}
        {unit && wide && (
          <div className="absolute bottom-3 right-0 z-10 w-[320px]">
            <UnitCard key={unit.id} unit={unit} text={O.units[unit.id]} labels={O} onClose={close} cardRef={card} />
          </div>
        )}
      </div>

      {/* The same choice as real buttons (keyboard, screen readers, touch) */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        {businessUnits.map((u) => (
          <button
            key={u.id}
            ref={(el) => (chips.current[u.id] = el)}
            type="button"
            data-orbit-control
            aria-pressed={selected === u.id}
            onClick={() => select(u.id)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(u.id)}
            onPointerLeave={() => setHovered(null)}
            className="chip !min-h-[44px] !px-4 !text-[13px]"
          >
            <span aria-hidden="true" className={`h-2 w-2 flex-none rounded-full ${DOT[u.id]}`} />
            {O.units[u.id].name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">{show3d ? O.hint : O.hintFlat}</p>

      {/* Summary card: under the orbit on small screens */}
      {unit && !wide && (
        <div className="mx-auto mt-5 max-w-md">
          <UnitCard key={unit.id} unit={unit} text={O.units[unit.id]} labels={O} onClose={close} cardRef={card} />
        </div>
      )}
    </section>
  );
}
