"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/components/Lang";
import { getMoments } from "@/data/home-data";
import { academyClasses } from "@/data/business-data";

// "Mau mulai dari mana?": three picture-led panels (Baca, Belajar, Gabung),
// each one a link to its section. On wide screens the panel under the
// pointer (or keyboard focus) opens wider and shows its description; on
// small screens they stack and show everything. The pictures are real NiFi
// material: report covers, class posters and a community photo.

const TINT = {
  blue: { dot: "bg-play-blue", bg: "from-play-blue/25" },
  violet: { dot: "bg-play-violet", bg: "from-play-violet/25" },
  cyan: { dot: "bg-play-cyan", bg: "from-play-cyan/20" },
};
const shadow = "shadow-[0_18px_40px_rgba(0,0,0,0.55)]";

// Three report covers, fanned.
function Covers({ covers, alt, open }) {
  const pose = [
    `left-0 top-8 -rotate-[10deg] ${open ? "lg:-translate-x-5 lg:-rotate-[14deg]" : ""}`,
    "left-10 top-0 z-10",
    `left-20 top-8 rotate-[10deg] ${open ? "lg:translate-x-5 lg:rotate-[14deg]" : ""}`,
  ];
  return covers.slice(0, 3).map((c, i) => (
    <Image
      key={c.src}
      src={c.src}
      alt={i === 1 ? alt(c.title) : ""}
      width={707}
      height={1000}
      sizes="160px"
      className={`absolute w-[150px] rounded-lg border border-white/15 transition-transform duration-500 ${shadow} ${pose[i]}`}
    />
  ));
}

// Three class posters, stepped down the panel.
function Posters({ alt, open }) {
  const pose = [
    `left-0 top-0 -rotate-3 ${open ? "lg:-translate-x-4" : ""}`,
    "left-10 top-12 z-10 rotate-2",
    `left-20 top-24 z-20 -rotate-2 ${open ? "lg:translate-x-4" : ""}`,
  ];
  return academyClasses.slice(0, 3).map((c, i) => (
    <Image
      key={c.file}
      src={`/content/academy/${c.file}`}
      alt={i === 2 ? alt(c.title) : ""}
      width={c.w}
      height={c.h}
      sizes="160px"
      className={`absolute aspect-[4/5] w-[150px] rounded-lg border border-white/15 object-cover object-top transition-transform duration-500 ${shadow} ${pose[i]}`}
    />
  ));
}

export default function PathShowcase({ covers }) {
  const { lang, t } = useLang();
  const [active, setActive] = useState(0);
  const photo = getMoments(lang)[0];

  return (
    <ul aria-label={t.paths.list} className="flex flex-col gap-3 lg:h-[470px] lg:flex-row">
      {t.paths.items.map((p, i) => {
        const open = i === active;
        const tint = TINT[p.hue];
        const isPhoto = p.id === "gabung";
        return (
          <li
            key={p.id}
            className={`min-w-0 transition-[flex-grow] duration-500 ease-out lg:basis-0 ${
              open ? "lg:grow-[2.2]" : "lg:grow"
            }`}
          >
            <a
              href={p.href}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onFocus={() => setActive(i)}
              className={`group relative flex h-full min-h-[270px] flex-col justify-between overflow-hidden rounded-[1.75rem] border bg-ink-900 transition-colors focus-visible:outline-offset-4 ${
                open ? "border-white/25" : "border-white/10"
              }`}
            >
              {/* Picture */}
              {isPhoto ? (
                <>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.w}
                    height={photo.h}
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/25"
                  />
                </>
              ) : (
                <>
                  <span aria-hidden="true" className={`absolute inset-0 bg-gradient-to-br ${tint.bg} via-ink-900 to-ink-900`} />
                  <span
                    className={`absolute right-[-30px] top-16 h-[300px] w-[230px] origin-top-right scale-[0.72] transition-transform duration-500 sm:scale-90 lg:scale-100 ${
                      open ? "lg:-translate-x-14" : ""
                    }`}
                  >
                    {p.id === "baca" ? (
                      <Covers covers={covers} alt={t.paths.coverAlt} open={open} />
                    ) : (
                      <Posters alt={t.learn.poster} open={open} />
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 hidden h-2/5 bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent lg:block"
                  />
                </>
              )}

              {/* Words */}
              <span className="relative flex items-center gap-2 p-6 text-xs font-medium uppercase tracking-[0.16em] text-slate-200 sm:p-7">
                <span className={`h-2 w-2 rounded-full ${tint.dot}`} aria-hidden="true" />
                {p.label}
              </span>

              <span className={`relative block p-6 pt-0 sm:p-7 sm:pt-0 ${isPhoto ? "" : "max-w-[66%] lg:max-w-[300px]"}`}>
                <span className="block font-display text-5xl font-extrabold tracking-tight text-white">
                  {p.verb}
                </span>
                <span
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ${
                    open ? "lg:grid-rows-[1fr] lg:opacity-100" : "lg:grid-rows-[0fr] lg:opacity-0"
                  }`}
                >
                  <span className="overflow-hidden">
                    <span className="block pt-3 text-[15px] leading-relaxed text-slate-300">{p.body}</span>
                  </span>
                </span>
                <span className="mt-5 flex">
                  <span
                    className={`min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 text-sm font-semibold text-ink-950 ${
                      open ? "inline-flex" : "inline-flex lg:hidden"
                    }`}
                  >
                    {p.cta}
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                  <span
                    aria-hidden="true"
                    className={`h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white ${
                      open ? "hidden" : "hidden lg:inline-flex"
                    }`}
                  >
                    <ArrowRight size={16} />
                  </span>
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
