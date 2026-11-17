"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useLang } from "@/components/Lang";
import { useMotion } from "@/components/Motion";
import { number, rupiah, shortDate, signedPercent } from "@/lib/format";
import { coalReport, prices, PUBLISHED } from "@/data/coal-paradox";

// The Coal Paradox, NiFi's latest report, with a chart of AADI against the
// JCI. Both lines are indexed to the close on the day the report came out,
// so they share one axis (percent change) and cross zero at publication.
// The stretch from publication to AADI's highest close is shaded, and the
// space between the two lines there is filled: that gap is the point of the
// chart. Hover, touch or use the arrow keys to read any date; the same
// numbers are in the table under the chart.

const AADI = "#8FAEFF"; // the site's cool accent
const JCI = "#6B7A90"; // neutral benchmark, drawn dashed
const H = 300;

const pubIndex = prices.findIndex((row) => row[0] === PUBLISHED);
const base = prices[pubIndex];
const points = prices.map(([date, aadi, jci]) => ({
  date,
  aadi,
  jci,
  a: (aadi / base[1] - 1) * 100,
  j: (jci / base[2] - 1) * 100,
}));
// AADI's highest close on or after publication.
const peakIndex = points.reduce((best, p, i) => (i >= pubIndex && p.aadi > points[best].aadi ? i : best), pubIndex);
const peak = points[peakIndex];

function Stat({ label, value, unit, sub, swatch }) {
  return (
    <div className="border-l border-white/15 pl-3 sm:pl-4">
      <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
        {swatch}
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-extrabold leading-none tracking-tight text-white sm:text-[1.75rem]">
        {value}
      </p>
      {unit && <p className="mt-1 text-xs text-slate-300">{unit}</p>}
      <p className="mt-1 text-xs tabular-nums text-slate-400">{sub}</p>
    </div>
  );
}

const lineKey = (color, dashed) => (
  <svg width="18" height="6" aria-hidden="true" className="flex-none">
    <line x1="1" y1="3" x2="17" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={dashed ? "4 4" : undefined} />
  </svg>
);

function Chart({ range }) {
  const { lang, t } = useLang();
  const { reduced } = useMotion();
  const C = t.coal;
  const box = useRef(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState(null);
  const [drawn, setDrawn] = useState(false);

  // Draw at the real pixel width so the labels keep their size on phones.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setDrawn(true), { threshold: 0.35 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const start = range === "since" ? pubIndex : 0;
  const data = useMemo(() => points.slice(start, peakIndex + 1), [start]);
  const narrow = width < 480;
  const m = { top: 30, right: narrow ? 62 : 104, bottom: 26, left: 40 };
  const plotW = width - m.left - m.right;
  const plotH = H - m.top - m.bottom;

  const values = data.flatMap((p) => [p.a, p.j]);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const step = hi - lo > 45 ? 20 : 10;
  const y0 = lo - (hi - lo) * 0.08;
  const y1 = hi + (hi - lo) * 0.1;
  const ticks = [];
  for (let v = Math.ceil(y0 / step) * step; v <= y1; v += step) ticks.push(v);

  const x = (i) => m.left + (data.length === 1 ? 0 : (i / (data.length - 1)) * plotW);
  const y = (v) => m.top + (1 - (v - y0) / (y1 - y0)) * plotH;
  const path = (key) => data.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join("");

  const pubAt = pubIndex - start;
  const last = data.length - 1;
  const gap =
    data
      .slice(pubAt)
      .map((p, i) => `${i ? "L" : "M"}${x(pubAt + i).toFixed(1)},${y(p.a).toFixed(1)}`)
      .join("") +
    data
      .slice(pubAt)
      .map((p, i) => [x(pubAt + i), y(p.j)])
      .reverse()
      .map(([px, py]) => `L${px.toFixed(1)},${py.toFixed(1)}`)
      .join("") +
    "Z";

  // X labels: the first trading day of every other month, or a few dates
  // when the range is short.
  const xTicks = [];
  if (range === "since") {
    const every = Math.max(1, Math.round(last / 3));
    for (let i = 0; i <= last; i += every) xTicks.push({ i, label: shortDate(data[i].date, lang).slice(0, -5) });
    if (last - xTicks[xTicks.length - 1].i < every / 2) xTicks.pop();
    xTicks.push({ i: last, label: shortDate(data[last].date, lang).slice(0, -5) });
  } else {
    data.forEach((p, i) => {
      const month = Number(p.date.slice(5, 7));
      if (i > 0 && p.date.slice(0, 7) !== data[i - 1].date.slice(0, 7) && month % 2 === 1) {
        xTicks.push({ i, label: shortDate(p.date, lang).split(" ")[1] });
      }
    });
  }

  const at = hover == null ? null : data[hover];
  const pick = (clientX) => {
    const rect = box.current.getBoundingClientRect();
    const ratio = (clientX - rect.left - m.left) / plotW;
    setHover(Math.max(0, Math.min(last, Math.round(ratio * last))));
  };
  const onKey = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHover((h) => Math.max(0, Math.min(last, (h ?? last) + (e.key === "ArrowRight" ? 1 : -1))));
  };

  const pubText = shortDate(PUBLISHED, lang);
  const peakText = shortDate(peak.date, lang);
  const tipLeft = at ? Math.max(86, Math.min(width - 86, x(hover))) : 0;

  return (
    <div
      ref={box}
      tabIndex={0}
      role="group"
      aria-label={C.chartAlt(pubText, peakText, signedPercent(peak.a, lang), signedPercent(peak.j, lang))}
      onKeyDown={onKey}
      onFocus={() => setHover((h) => h ?? last)}
      onBlur={() => setHover(null)}
      className="relative mt-6 select-none rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cool"
      style={{ touchAction: "pan-y" }}
    >
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${width} ${H}`}
        aria-hidden="true"
        className="block overflow-visible"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
      >
        {/* Publication to peak */}
        <rect x={x(pubAt)} y={m.top} width={x(last) - x(pubAt)} height={plotH} fill={AADI} opacity="0.07" />

        {/* Grid */}
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={m.left}
              x2={m.left + plotW}
              y1={y(v)}
              y2={y(v)}
              stroke="#ffffff"
              strokeOpacity={v === 0 ? 0.32 : 0.08}
              strokeWidth="1"
            />
            <text x={m.left - 8} y={y(v) + 4} textAnchor="end" className="fill-slate-400 text-[11px] tabular-nums">
              {v > 0 ? `+${v}` : v}%
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text key={tick.i} x={x(tick.i)} y={H - 6} textAnchor={tick.i === last ? "end" : "middle"} className="fill-slate-400 text-[11px]">
            {tick.label}
          </text>
        ))}

        {/* The day the report came out */}
        <line x1={x(pubAt)} x2={x(pubAt)} y1={m.top - 8} y2={m.top + plotH} stroke="#ffffff" strokeOpacity="0.55" strokeDasharray="3 4" />
        <text
          x={x(pubAt) + (range === "since" ? 0 : -8)}
          y={m.top - 14}
          textAnchor={range === "since" ? "start" : "end"}
          className="fill-slate-200 text-[11px] font-medium"
        >
          {`${C.marker} · ${pubText.slice(0, -5)}`}
        </text>

        {/* The gap between the two lines after publication */}
        <path d={gap} fill={AADI} opacity="0.16" />

        <path d={path("j")} fill="none" stroke={JCI} strokeWidth="2" strokeDasharray="5 5" strokeLinejoin="round" />
        <path
          key={range}
          d={path("a")}
          pathLength="1"
          fill="none"
          stroke={AADI}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="1"
          style={{
            strokeDashoffset: drawn || reduced ? 0 : 1,
            transition: reduced ? "none" : "stroke-dashoffset 1.6s cubic-bezier(0.3, 0.6, 0.2, 1)",
          }}
        />

        {/* Ends of the lines, labelled */}
        {[
          { key: "j", color: JCI, name: C.index, v: peak.j },
          { key: "a", color: AADI, name: "AADI", v: peak.a },
        ].map((s) => (
          <g key={s.key}>
            <circle cx={x(last)} cy={y(s.v)} r="5" fill={s.color} stroke="#0D0F12" strokeWidth="2" />
            <text x={x(last) + 11} y={y(s.v) - (narrow ? -4 : 1)} className="fill-white text-[12px] font-semibold tabular-nums">
              {narrow ? signedPercent(s.v, lang) : s.name}
            </text>
            {!narrow && (
              <text x={x(last) + 11} y={y(s.v) + 14} className="fill-slate-300 text-[12px] tabular-nums">
                {signedPercent(s.v, lang)}
              </text>
            )}
          </g>
        ))}

        {/* Reading one date */}
        {at && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={m.top} y2={m.top + plotH} stroke="#ffffff" strokeOpacity="0.45" />
            <circle cx={x(hover)} cy={y(at.j)} r="4.5" fill={JCI} stroke="#0D0F12" strokeWidth="2" />
            <circle cx={x(hover)} cy={y(at.a)} r="4.5" fill={AADI} stroke="#0D0F12" strokeWidth="2" />
          </g>
        )}
      </svg>

      {at && (
        <div
          role="status"
          className="pointer-events-none absolute top-0 z-10 w-[172px] -translate-x-1/2 rounded-lg border border-white/15 bg-ink-800/95 px-3 py-2.5 text-xs shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
          style={{ left: tipLeft }}
        >
          <p className="font-medium text-slate-300">{shortDate(at.date, lang)}</p>
          <p className="mt-1.5 flex items-center gap-2 tabular-nums">
            {lineKey(AADI)}
            <span className="font-semibold text-white">{signedPercent(at.a, lang)}</span>
            <span className="ml-auto text-slate-400">{rupiah(at.aadi, lang)}</span>
          </p>
          <p className="mt-1 flex items-center gap-2 tabular-nums">
            {lineKey(JCI, true)}
            <span className="font-semibold text-white">{signedPercent(at.j, lang)}</span>
            <span className="ml-auto text-slate-400">{number(at.jci, lang)}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default function CoalFeature() {
  const { lang, t } = useLang();
  const C = t.coal;
  const [range, setRange] = useState("all");
  const pubText = shortDate(PUBLISHED, lang);
  const peakText = shortDate(peak.date, lang);
  const gap = (peak.a - peak.j).toFixed(1);

  return (
    <article aria-labelledby="coal-title" className="win grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
      {/* The report */}
      <div className="border-b border-white/[0.08] p-6 sm:p-8 lg:border-b-0 lg:border-r">
        <p className="micro flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-cool">{C.tag}</span>
          <span>{C.published(pubText)}</span>
        </p>
        <div className="mt-6 flex items-start gap-5">
          <Image
            src={coalReport.cover}
            alt={C.coverAlt}
            width={900}
            height={1274}
            sizes="140px"
            className="w-[104px] flex-none -rotate-3 rounded-md border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.6)] sm:w-[128px]"
          />
          <div className="min-w-0">
            <h3 id="coal-title" className="text-3xl leading-[1.08] sm:text-4xl">
              {coalReport.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{coalReport.subtitle}</p>
          </div>
        </div>

        <p className="mt-7 text-[15px] leading-relaxed text-slate-300">{C.lead}</p>

        <p className="micro mt-7">{C.topicsLabel}</p>
        <ul className="mt-3 border-t border-white/[0.08]">
          {C.topics.map((topic, i) => (
            <li key={topic} className="flex gap-3 border-b border-white/[0.08] py-2.5 text-sm text-slate-200">
              <span className="font-mono text-xs leading-5 text-cool">0{i + 1}</span>
              {topic}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs leading-relaxed text-slate-400">
          {C.by} {coalReport.authors.join(", ")}
        </p>
      </div>

      {/* AADI against the index */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div>
            <h4 className="font-display text-xl font-bold leading-tight text-white">{C.chartTitle}</h4>
            <p className="mt-1 text-sm text-slate-400">{C.chartSub}</p>
          </div>
          <div role="group" aria-label={C.ranges} className="flex gap-2">
            {["all", "since"].map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={range === key}
                onClick={() => setRange(key)}
                className="chip !min-h-[36px] !px-3.5 !text-xs"
              >
                {C[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-5">
          <Stat
            label="AADI"
            swatch={lineKey(AADI)}
            value={signedPercent(peak.a, lang)}
            sub={C.to(rupiah(base[1], lang), rupiah(peak.aadi, lang))}
          />
          <Stat
            label={C.index}
            swatch={lineKey(JCI, true)}
            value={signedPercent(peak.j, lang)}
            sub={C.to(number(base[2], lang), number(peak.jci, lang))}
          />
          <Stat label={C.gap} value={lang === "en" ? gap : gap.replace(".", ",")} unit={C.gapUnit} sub={`${pubText.slice(0, -5)} - ${peakText}`} />
        </div>

        <Chart range={range} />

        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2">
            {lineKey(AADI)}
            AADI
          </span>
          <span className="inline-flex items-center gap-2">
            {lineKey(JCI, true)}
            {C.index}
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-4 flex-none rounded-sm bg-cool/25" />
            {C.band}
          </span>
        </p>

        <p className="mt-5 text-[15px] leading-relaxed text-slate-300">
          {C.result(pubText, peakText, signedPercent(peak.a, lang).slice(1), signedPercent(peak.j, lang).slice(1))}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          {C.note(shortDate(points[0].date, lang), peakText)} {C.disclaimer}
        </p>

        <details className="mt-4 text-xs text-slate-300">
          <summary className="inline-flex min-h-[44px] cursor-pointer items-center underline-offset-4 hover:text-white hover:underline">
            {C.table}
          </summary>
          <div className="scroll-quiet mt-2 max-h-64 overflow-y-auto rounded-lg border border-white/10">
            <table className="w-full text-left tabular-nums">
              <thead className="sticky top-0 bg-ink-800 text-slate-400">
                <tr>
                  {C.cols.map((col, i) => (
                    <th key={col} scope="col" className={`px-3 py-2 font-medium ${i ? "text-right" : ""}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {points
                  .slice()
                  .reverse()
                  .map((p) => (
                    <tr key={p.date} className={`border-t border-white/[0.06] ${p.date === PUBLISHED ? "bg-cool/10 text-white" : ""}`}>
                      <td className="px-3 py-1.5">{shortDate(p.date, lang)}</td>
                      <td className="px-3 py-1.5 text-right">{number(p.aadi, lang)}</td>
                      <td className="px-3 py-1.5 text-right">{number(p.jci, lang)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </article>
  );
}
