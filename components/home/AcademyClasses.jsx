"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { academyClasses, academyIncubation } from "@/data/business-data";
import { useLang } from "@/components/Lang";
import { monthYear } from "@/lib/format";

// Real NiFi Academy sessions that have already run, as a poster rail
// (posters supplied by NiFi). No upcoming dates are invented; visitors are
// pointed to the channel where new classes are announced.
export default function AcademyClasses() {
  const { lang, t } = useLang();
  const L = t.learn;
  const about = L.classesBody(academyIncubation.title, academyIncubation.period.replace("–", "-"));
  const rail = useRef(null);
  const slide = (dir) => rail.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  return (
    <div id="kelas" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-xl">
          <p className="micro">NiFi Academy · #NiFiBerbagi</p>
          <h3 className="mt-3 text-2xl leading-tight sm:text-3xl">{L.classesTitle}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {about[0]}
            <span className="text-slate-200">{about[1]}</span>
            {about[2]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={siteConfig.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="link-arrow mr-2 min-h-[44px]"
          >
            {L.classesLink}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => slide(-1)}
            aria-label={L.prev}
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-white/50 sm:inline-flex"
          >
            <ArrowLeft size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => slide(1)}
            aria-label={L.nextClass}
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-white/50 sm:inline-flex"
          >
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={rail}
        tabIndex={0}
        aria-label={L.classesList}
        className="scroll-quiet -mx-5 mt-7 flex snap-x gap-4 overflow-x-auto px-5 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
      >
        {academyClasses.map((c) => (
          <li key={c.file} className="group w-[210px] flex-none snap-start sm:w-[230px]">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-800 transition-transform duration-300 group-hover:-translate-y-1.5">
              <Image
                src={`/content/academy/${c.file}`}
                alt={L.poster(c.title)}
                width={c.w}
                height={c.h}
                sizes="230px"
                className="aspect-[4/5] h-auto w-full object-cover object-top"
              />
            </div>
            <p className="mt-3 text-sm font-semibold leading-snug text-white">{c.title}</p>
            <p className="mt-1 font-mono text-[11px] text-slate-400">
              {c.speaker} · {monthYear(c.date, lang)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
