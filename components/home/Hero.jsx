"use client";

import { ArrowDown } from "lucide-react";
import HighlightHeadline from "@/components/HighlightHeadline";
import { useLang } from "@/components/Lang";
import PlaygroundStage from "./PlaygroundStage";
import AskBar from "./AskBar";

// Copy on the left is readable immediately; the interactive stage on the
// right loads its 3D scene afterwards. The headline is NiFi's tagline and
// stays in English in both languages.
export default function Hero() {
  const { t } = useLang();
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-6 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_1.08fr] lg:gap-8 lg:pt-14">
      <div>
        <p className="eyebrow">{t.hero.eyebrow}</p>
        <HighlightHeadline
          lead="Finance, for people who are"
          highlight="not into finance."
          className="mt-6 text-[2.6rem] font-extrabold leading-[1.06] sm:text-6xl lg:text-[3.5rem] xl:text-[3.9rem]"
        />
        <p className="mt-7 max-w-lg text-lg leading-relaxed text-slate-400">{t.hero.sub}</p>
        <div className="mt-8 max-w-lg">
          <AskBar />
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a href="#mulai" className="btn-primary">
            {t.hero.start}
            <ArrowDown size={16} aria-hidden="true" />
          </a>
          <a href="#research" className="btn-secondary">
            {t.hero.explore}
          </a>
        </div>
      </div>

      <PlaygroundStage />
    </section>
  );
}
