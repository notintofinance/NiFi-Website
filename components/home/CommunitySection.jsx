"use client";

import Image from "next/image";
import SocialLinks from "@/components/SocialLinks";
import { siteConfig } from "@/data/site-config";
import { useLang } from "@/components/Lang";
import { getMoments } from "@/data/home-data";

// The human side of NiFi: real photos from meetups and events, and the way
// in (Discord). No member counts or testimonials are shown.
export default function CommunitySection() {
  const { lang, t } = useLang();
  const C = t.community;
  const [lead, ...rest] = getMoments(lang);
  const dots = ["bg-play-cyan", "bg-play-violet", "bg-play-pink"];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
      <div className="grid grid-cols-3 gap-3">
        <figure className="col-span-3">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
            <Image
              src={lead.src}
              alt={lead.alt}
              width={lead.w}
              height={lead.h}
              sizes="(max-width: 1024px) 100vw, 640px"
              className="aspect-[16/9] h-auto w-full object-cover"
            />
          </div>
          <figcaption className="mt-2 text-xs text-slate-400">{lead.caption}</figcaption>
        </figure>
        {rest.map((m) => (
          <figure key={m.src}>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-800">
              <Image
                src={m.src}
                alt={m.alt}
                width={m.w}
                height={m.h}
                sizes="(max-width: 1024px) 33vw, 210px"
                className="aspect-square h-auto w-full object-cover"
              />
            </div>
            <figcaption className="mt-2 text-xs text-slate-400">{m.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-lg leading-relaxed text-slate-300">
          {C.body}
        </p>
        <ul className="mt-6 space-y-3 text-sm text-slate-400">
          {C.points.map((point, i) => (
            <li key={point} className="flex gap-3">
              <span className={`mt-2 h-1.5 w-1.5 flex-none rounded-full ${dots[i]}`} />
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <a
            href={siteConfig.links.community}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Image
              src="/discord-logo.png"
              alt=""
              width={24}
              height={24}
              className="h-5 w-5 rounded-[5px]"
            />
            {C.join}
          </a>
        </div>
        <div className="mt-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {C.follow}
          </p>
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}
