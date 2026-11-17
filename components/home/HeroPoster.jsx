"use client";

import { useLang } from "@/components/Lang";

// 2D stand-in for the 3D hero: the same cards as real buttons that flip in
// place. Shown while the scene loads, and whenever WebGL is unavailable, the
// scene fails, or motion is reduced. Fully keyboard-operable.
const TILT = [
  "-rotate-3 translate-y-1",
  "rotate-2 -translate-y-2",
  "-rotate-2 translate-y-2",
  "rotate-3 translate-y-1",
  "-rotate-1 -translate-y-1",
  "rotate-2 translate-y-2",
  "-rotate-2 -translate-y-1",
  "rotate-1 translate-y-1",
  "-rotate-3 -translate-y-2",
];

const HUE = {
  blue: "bg-play-blue",
  violet: "bg-play-violet",
  pink: "bg-play-pink",
  cyan: "bg-play-cyan",
};

export default function HeroPoster({ items, tidy, revealed, onReveal }) {
  const { t } = useLang();
  return (
    <ul className="grid h-full grid-cols-2 content-center gap-3 sm:grid-cols-3 sm:gap-4">
      {items.map((item, i) => {
        const open = revealed === i;
        return (
          <li
            key={item.term}
            className={`transition-transform duration-500 ${i > 5 ? "hidden sm:block" : ""} ${
              tidy || open ? "" : TILT[i]
            }`}
          >
            <button
              type="button"
              aria-pressed={open}
              aria-label={`${item.term}. ${open ? item.meaning : t.hero.cardHint}`}
              onClick={() => onReveal(open ? null : i)}
              className="flip block h-[104px] w-full rounded-2xl text-left sm:h-[124px]"
            >
              <span className="flip-inner">
                <span className="flip-face flex flex-col justify-between rounded-2xl border border-white/10 bg-ink-800 p-4">
                  <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                    <span className={`h-1.5 w-1.5 rounded-full ${HUE[item.hue]}`} />
                    {t.hero.cardLabel}
                  </span>
                  <span className="font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
                    {item.term}
                  </span>
                </span>
                <span
                  className={`flip-face flip-back flex items-center rounded-2xl p-4 text-[12px] font-semibold leading-snug text-ink-950 sm:text-sm ${HUE[item.hue]}`}
                >
                  {item.meaning}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
