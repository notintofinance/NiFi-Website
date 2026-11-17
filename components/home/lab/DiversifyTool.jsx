"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/components/Lang";
import { Slider, Figure } from "./parts";

// Why spreading money across several things smooths the ride. The "assets"
// are made-up random series (fixed seed, so the picture is stable), each
// moving on its own. The portfolio line is simply their average.

const ASSETS = 20;
const POINTS = 48;

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SERIES = (() => {
  const rand = mulberry32(72);
  return Array.from({ length: ASSETS }, () =>
    Array.from({ length: POINTS }, () => (rand() + rand() + rand() - 1.5) / 1.5)
  );
})();

const spread = (s) => Math.sqrt(s.reduce((sum, v) => sum + v * v, 0) / s.length);
const SINGLE = spread(SERIES[0]); // the grey line: one asset on its own

export default function DiversifyTool() {
  const { t } = useLang();
  const L = t.lab;
  const [n, setN] = useState(1);

  const portfolio = useMemo(
    () => Array.from({ length: POINTS }, (_, i) => SERIES.slice(0, n).reduce((s, a) => s + a[i], 0) / n),
    [n]
  );
  const swing = Math.round((spread(portfolio) / SINGLE) * 100);
  const many = L.diversifyMany(n, swing);

  const W = 300;
  const H = 120;
  const path = (s) =>
    s.map((v, i) => `${i ? "L" : "M"} ${(i / (POINTS - 1)) * W} ${H / 2 - v * (H / 2 - 6)}`).join(" ");

  return (
    <div className="flex flex-1 flex-col">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={L.diversifyAlt(n, swing)} className="h-auto w-full">
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.14)" strokeDasharray="3 5" />
        <path d={path(SERIES[0])} fill="none" stroke="rgba(148,163,184,0.45)" strokeWidth="1.5" />
        <path d={path(portfolio)} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <p className="mt-2 flex gap-4 font-mono text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-slate-500" aria-hidden="true" />
          {L.oneAsset}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-play-violet" aria-hidden="true" />
          {L.portfolio}
        </span>
      </p>

      <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
        {n === 1 ? (
          L.diversifyOne
        ) : (
          <>
            {many[0]}
            <Figure>{many[1]}</Figure>
            {many[2]}
          </>
        )}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{L.diversifyNote}</p>

      <div className="mt-auto pt-6">
        <Slider label={L.assets} value={n} display={L.assetCount(n)} min={1} max={ASSETS} step={1} onChange={setN} />
      </div>
    </div>
  );
}
