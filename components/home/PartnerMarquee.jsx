"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { partners } from "@/data/business-data";
import { useLang } from "@/components/Lang";

// Moving band of partner logos. Two copies of the list sit on one track that
// slides by half its width, so the loop is seamless. Hover pauses it; with
// reduced motion it becomes a static row (see globals.css).
export default function PartnerMarquee() {
  const { t } = useLang();
  return (
    <section aria-labelledby="partners-title" className="mt-12 sm:mt-16">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <h2
          id="partners-title"
          className="whitespace-nowrap font-sans text-xs font-medium uppercase tracking-[0.2em] text-slate-400"
        >
          {t.partners.title}
        </h2>
        <Link href="/for-business#partnerships" className="link-arrow min-h-[44px] whitespace-nowrap">
          <span className="sm:hidden">{t.partners.linkShort}</span>
          <span className="hidden sm:inline">{t.partners.link}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div className="marquee-band group mt-3 overflow-hidden border-y border-white/[0.08] py-6 sm:py-8 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:[mask-image:none]">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
              className={`flex flex-none items-center ${
                copy === 1
                  ? "motion-reduce:hidden"
                  : "motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-8"
              }`}
            >
              {partners.map((p) => (
                <li key={p.file} className="flex w-[168px] flex-none justify-center px-6">
                  <Image
                    src={`/partners/mono/${p.file}`}
                    alt={copy === 1 ? "" : p.name}
                    title={p.name}
                    width={p.w}
                    height={p.h}
                    className={`${
                      p.w / p.h < 2.8 ? "max-h-10" : "max-h-7"
                    } w-auto max-w-full object-contain opacity-75`}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
