"use client";

import { useState } from "react";
import { useLang } from "@/components/Lang";
import { decimal } from "@/lib/format";
import { Slider, Figure } from "./parts";

// Rule of 72: years to double ≈ 72 ÷ yearly return (in percent).
const STEPS = [1, 2, 4, 8];

export default function Rule72Tool() {
  const { lang, t } = useLang();
  const L = t.lab;
  const [rate, setRate] = useState(7);
  const approx = 72 / rate;
  const exact = Math.log(2) / Math.log(1 + rate / 100);
  const d = (n) => decimal(n, lang);
  const [before, figure, after] = L.rule72Text(d(rate), d(approx), d(exact));

  return (
    <div className="flex flex-1 flex-col">
      <ol aria-label={L.rule72Alt(d(rate), d(approx))} className="relative flex items-end justify-between">
        <span aria-hidden="true" className="absolute inset-x-6 bottom-[34px] h-px bg-white/15" />
        {STEPS.map((m, i) => {
          const size = 30 + i * 18;
          return (
            <li key={m} className="relative flex w-20 flex-col items-center">
              <span
                className="flex items-center justify-center rounded-full border border-play-cyan/70 bg-play-cyan/15 font-display font-bold text-white"
                style={{ width: size, height: size, fontSize: 12 + i * 3 }}
              >
                {m}×
              </span>
              <span className="mt-3 h-2 w-2 rounded-full bg-play-cyan" aria-hidden="true" />
              <span className="mt-2 font-mono text-[11px] text-slate-400">
                {i === 0 ? L.rule72Now : `${d(approx * i)} ${L.rule72Unit}`}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-[15px] leading-relaxed text-slate-300">
        {before}
        <Figure>{figure}</Figure>
        {after}
      </p>

      <div className="mt-auto pt-6">
        <Slider label={L.returnRate} value={rate} display={`${d(rate)}%`} min={1} max={15} step={0.5} onChange={setRate} />
      </div>
    </div>
  );
}
