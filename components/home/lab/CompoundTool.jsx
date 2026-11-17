"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/components/Lang";
import { rupiah } from "@/lib/format";
import { Slider } from "./parts";

// How regular contributions grow with compounding (fixed example rate).

const RATES = [
  { value: 0.04, label: "4%" },
  { value: 0.07, label: "7%" },
  { value: 0.1, label: "10%" },
];

// Value after each year of monthly contributions, compounded monthly.
function project(monthly, years, rate) {
  const r = rate / 12;
  return Array.from({ length: years + 1 }, (_, y) => {
    const n = y * 12;
    const paid = monthly * n;
    const value = r === 0 ? paid : monthly * ((Math.pow(1 + r, n) - 1) / r);
    return { year: y, paid, value };
  });
}

export default function CompoundTool() {
  const { lang, t } = useLang();
  const L = t.lab;
  const [years, setYears] = useState(10);
  const [monthly, setMonthly] = useState(500000);
  const [rate, setRate] = useState(0.07);

  const data = useMemo(() => project(monthly, years, rate), [monthly, years, rate]);
  const last = data[data.length - 1];
  const growth = last.value - last.paid;
  const growthShare = last.value > 0 ? Math.round((growth / last.value) * 100) : 0;

  const W = 560;
  const H = 220;
  const pad = { l: 6, r: 6, t: 12, b: 26 };
  const x = (y) => pad.l + (y / years) * (W - pad.l - pad.r);
  const yScale = (v) => H - pad.b - (v / last.value) * (H - pad.t - pad.b);
  const area = (key) =>
    `M ${x(0)} ${H - pad.b} ` +
    data.map((d) => `L ${x(d.year)} ${yScale(d[key])}`).join(" ") +
    ` L ${x(years)} ${H - pad.b} Z`;
  const line = (key) => data.map((d, i) => `${i ? "L" : "M"} ${x(d.year)} ${yScale(d[key])}`).join(" ");

  return (
    <div className="grid flex-1 gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
      <div className="flex flex-col gap-6">
        <Slider label={L.time} value={years} display={L.years(years)} min={1} max={30} step={1} onChange={setYears} />
        <Slider
          label={L.monthly}
          value={monthly}
          display={rupiah(monthly, lang)}
          min={100000}
          max={5000000}
          step={100000}
          onChange={setMonthly}
        />
        <fieldset>
          <legend className="text-sm font-medium text-slate-300">{L.rate}</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {RATES.map((r) => (
              <label
                key={r.value}
                className={`flex min-h-[44px] cursor-pointer items-center justify-center rounded-full border text-sm font-semibold transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cool ${
                  rate === r.value
                    ? "border-white bg-white text-ink-950"
                    : "border-white/15 text-slate-300 hover:border-white/40"
                }`}
              >
                <input
                  type="radio"
                  name="compound-rate"
                  value={r.value}
                  checked={rate === r.value}
                  onChange={() => setRate(r.value)}
                  className="sr-only"
                />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <p className="text-sm text-slate-400">{L.estimate(years)}</p>
        <p className="mt-1 font-display text-4xl font-extrabold tracking-tight text-white sm:text-[2.75rem]">
          {rupiah(last.value, lang)}
        </p>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          <div className="border-l-2 border-slate-500 pl-3">
            <dt className="text-xs text-slate-400">{L.paid}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-white">{rupiah(last.paid, lang)}</dd>
          </div>
          <div className="border-l-2 border-cool pl-3">
            <dt className="text-xs text-slate-400">{L.growth(growthShare)}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-white">{rupiah(growth, lang)}</dd>
          </div>
        </dl>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={L.compoundAlt(years, rupiah(last.paid, lang), rupiah(last.value, lang), growthShare)}
          className="mt-4 h-auto w-full"
        >
          <defs>
            <linearGradient id="lab-growth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8FAEFF" stopOpacity="0.55" />
              <stop offset="1" stopColor="#8FAEFF" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="rgba(255,255,255,0.14)" />
          <path d={area("value")} fill="url(#lab-growth)" />
          <path d={area("paid")} fill="rgba(148,163,184,0.28)" />
          <path d={line("value")} fill="none" stroke="#8FAEFF" strokeWidth="2.5" strokeLinejoin="round" />
          <path d={line("paid")} fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5 5" />
          <text x={pad.l} y={H - 7} fill="#94A3B8" fontSize="13">
            {L.now}
          </text>
          <text x={W - pad.r} y={H - 7} fill="#94A3B8" fontSize="13" textAnchor="end">
            {L.years(years)}
          </text>
        </svg>
      </div>
    </div>
  );
}
