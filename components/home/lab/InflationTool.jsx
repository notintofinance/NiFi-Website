"use client";

import { useState } from "react";
import { useLang } from "@/components/Lang";
import { rupiah, decimal } from "@/lib/format";
import { Slider, Figure } from "./parts";

// What Rp100.000 can still buy after N years of steady price rises.
const START = 100000;
const CELLS = 50;

export default function InflationTool() {
  const { lang, t } = useLang();
  const L = t.lab;
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(4);

  const power = START / Math.pow(1 + rate / 100, years);
  const filled = Math.round((power / START) * CELLS);
  const lost = Math.round((1 - power / START) * 100);
  const [before, value, after] = L.inflationText(years, rupiah(power, lang), lost);

  return (
    <div className="flex flex-1 flex-col">
      <div role="img" aria-label={L.inflationAlt(filled, 100 - lost)} className="grid grid-cols-10 gap-1">
        {Array.from({ length: CELLS }, (_, i) => (
          <span
            key={i}
            className={`aspect-square rounded-[3px] transition-colors duration-300 ${
              i < filled ? "bg-play-pink" : "bg-white/[0.07]"
            }`}
          />
        ))}
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-slate-300">
        {before}
        <Figure>{value}</Figure>
        {after}
      </p>

      <div className="mt-auto flex flex-col gap-4 pt-6">
        <Slider label={L.time} value={years} display={L.years(years)} min={1} max={30} step={1} onChange={setYears} />
        <Slider
          label={L.inflationRate}
          value={rate}
          display={`${decimal(rate, lang)}%`}
          min={1}
          max={10}
          step={0.5}
          onChange={setRate}
        />
      </div>
    </div>
  );
}
