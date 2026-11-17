"use client";

import Image from "next/image";
import { Mail, ArrowDown, ArrowUpRight, Check, Plus } from "lucide-react";
import Reveal from "@/components/Reveal";
import HighlightHeadline from "@/components/HighlightHeadline";
import BusinessOrbit from "./BusinessOrbit";
import { useLang } from "@/components/Lang";
import { monthYear } from "@/lib/format";
import { siteConfig } from "@/data/site-config";
import { services, partners, partnerGroups, academyIncubation, academyBootcamp, academyClasses } from "@/data/business-data";
import { businessCopy } from "@/data/business-copy";

// The For Business page body. Structure and images come from
// data/business-data.js; the words (two languages) from data/business-copy.js.

const micro = "text-xs font-medium uppercase tracking-[0.18em] text-slate-400";
const EVENT_SHOTS = [
  { src: "/content/events/doo-financial-event.jpg", w: 1600, h: 1066 },
  { src: "/community/activity-ramadan.jpg", w: 1600, h: 1200 },
  { src: "/community/nifiberbagi-1.jpg", w: 1600, h: 900 },
];
const formatImages = services.find((s) => s.id === "brand-placement").formats.map((f) => f.example);

// Real NiFi material shown beside each service.
function Shot({ src, w, h, alt, caption, imgClassName, sizes = "(max-width: 1024px) 50vw, 320px" }) {
  return (
    <figure>
      <div className="overflow-hidden rounded-xl border border-white/15 bg-ink-800">
        <Image src={src} alt={alt} width={w} height={h} sizes={sizes} className={imgClassName} />
      </div>
      <figcaption className="mt-2.5 text-xs text-slate-400">{caption}</figcaption>
    </figure>
  );
}

function BrandPlacement({ c }) {
  const s = c.services["brand-placement"];
  return (
    <>
      <p className={micro}>{c.formats}</p>
      <ol className="mt-4 grid gap-4 sm:grid-cols-2">
        {s.formats.map((f, i) => (
          <li key={f.name} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
            <figure className="border-b border-white/10">
              <Image
                src={formatImages[i].src}
                alt={f.alt}
                width={formatImages[i].w}
                height={formatImages[i].h}
                sizes="(max-width: 640px) 100vw, 340px"
                className="aspect-[4/3] h-auto w-full object-cover object-top"
              />
              <figcaption className="sr-only">{f.caption}</figcaption>
            </figure>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-cool">
                {c.format} 0{i + 1}
              </p>
              <h3 className="mt-2 text-2xl leading-[1.15]">{f.name}</h3>
              <ul className="mt-4 space-y-2.5">
                {f.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-snug text-slate-300">
                    <Check size={16} className="mt-0.5 flex-none text-cool" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-5 text-xs text-slate-400">{f.caption}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 px-5 py-4 text-sm text-slate-300">
        <Plus size={16} className="flex-none text-cool" aria-hidden="true" />
        <span>
          <span className="font-medium text-white">{c.addOn} · </span>
          {s.addOn}
        </span>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-400">{c.examplesNote}</p>
    </>
  );
}

function Events({ c }) {
  const [lead, ...rest] = EVENT_SHOTS.map((shot, i) => ({ ...shot, ...c.events[i] }));
  return (
    <div className="space-y-3 sm:space-y-4">
      <Shot {...lead} sizes="(max-width: 1024px) 100vw, 700px" imgClassName="aspect-[3/2] h-auto w-full object-cover" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {rest.map((shot) => (
          <Shot key={shot.src} {...shot} imgClassName="aspect-[4/3] h-auto w-full object-cover" />
        ))}
      </div>
    </div>
  );
}

function Academy({ c, lang }) {
  return (
    <div className="space-y-10">
      {/* Incubation program */}
      <div className="grid items-center gap-6 rounded-2xl border border-white/10 bg-ink-900 p-5 sm:grid-cols-[0.8fr_1fr] sm:p-6">
        <div className="overflow-hidden rounded-xl border border-white/15">
          <Image
            src={`/content/academy/${academyIncubation.file}`}
            alt={c.incubationAlt}
            width={academyIncubation.w}
            height={academyIncubation.h}
            sizes="(max-width: 640px) 100vw, 300px"
            className="h-auto w-full"
          />
        </div>
        <div>
          <p className={micro}>
            {c.program} · {academyIncubation.period.replace("–", "-")}
          </p>
          <h3 className="mt-3 text-xl leading-[1.2] sm:text-2xl">{academyIncubation.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.incubation.summary}</p>
          <ol className="mt-5 border-t border-white/[0.08]">
            {c.incubation.steps.map((step, i) => (
              <li key={step} className="flex gap-3 border-b border-white/[0.08] py-2.5 text-sm text-slate-300">
                <span className="text-cool">0{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Equity Research Bootcamp */}
      <div className="grid items-center gap-6 rounded-2xl border border-white/10 bg-ink-900 p-5 sm:grid-cols-[1fr_0.8fr] sm:p-6">
        <div className="order-2 sm:order-1">
          <p className={micro}>{c.bootcamp.label}</p>
          <h3 className="mt-3 text-xl leading-[1.2] sm:text-2xl">{academyBootcamp.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.bootcamp.summary}</p>
          <p className={`mt-5 ${micro}`}>{c.bootcamp.from}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {academyBootcamp.institutions.map((name) => (
              <li key={name} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                {name}
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 overflow-hidden rounded-xl border border-white/15 sm:order-2">
          <Image
            src={`/content/academy/${academyBootcamp.file}`}
            alt={c.bootcamp.alt}
            width={academyBootcamp.w}
            height={academyBootcamp.h}
            sizes="(max-width: 640px) 100vw, 300px"
            className="h-auto w-full"
          />
        </div>
      </div>

      {/* Past online classes */}
      <div>
        <p className={micro}>{c.pastClasses}</p>
        <div role="region" aria-label={c.pastClassesLabel} tabIndex={0} className="mt-4 overflow-x-auto">
          <ul className="flex w-max gap-4 pb-3">
            {academyClasses.map((cls) => (
              <li key={cls.file} className="w-[150px] flex-none sm:w-[168px]">
                <div className="overflow-hidden rounded-lg border border-white/15">
                  <Image
                    src={`/content/academy/${cls.file}`}
                    alt={c.classAlt(cls.title, cls.speaker)}
                    width={cls.w}
                    height={cls.h}
                    sizes="170px"
                    className="aspect-[4/5] h-auto w-full object-cover object-top"
                  />
                </div>
                <p className="mt-2.5 line-clamp-2 text-xs font-medium leading-snug text-slate-200">{cls.title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {cls.speaker} · {monthYear(cls.date, lang)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Arthara({ c }) {
  return (
    <div className="flex flex-col items-start gap-6 rounded-2xl border border-white/10 bg-ink-900 p-7 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-ink-800">
          <Image src="/arthara-mark-white.png" alt="" width={512} height={484} className="h-7 w-7 object-contain" />
        </span>
        <div>
          <p className="text-base font-semibold text-white">Arthara</p>
          <p className="text-sm text-slate-400">arthara.id</p>
        </div>
      </div>
      <a href={siteConfig.links.arthara} target="_blank" rel="noopener noreferrer" className="btn-secondary">
        {c.exploreArthara}
        <ArrowUpRight size={15} className="text-slate-500" aria-hidden="true" />
      </a>
    </div>
  );
}

const VISUALS = { "brand-placement": BrandPlacement, events: Events, academy: Academy, arthara: Arthara };

export default function ForBusinessContent() {
  const { lang } = useLang();
  const c = businessCopy[lang];
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(c.mailSubject)}`;

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-6">
        <div>
          <p className="eyebrow">{c.eyebrow}</p>
          <HighlightHeadline
            key={lang}
            lead={c.headline[0]}
            highlight={c.headline[1]}
            className="mt-6 text-[2.75rem] font-extrabold leading-[1.06] sm:text-6xl lg:text-[4rem] xl:text-[4.4rem]"
          />
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-400">{c.sub}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href={mailto} className="btn-primary">
              <Mail size={17} aria-hidden="true" />
              {c.discuss}
            </a>
            <a href="#services" className="btn-secondary">
              {c.seeServices}
              <ArrowDown size={15} className="text-slate-500" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* The business ecosystem, in orbit */}
        <BusinessOrbit />
      </section>

      {/* ── Services + Previous Partnerships ─────────────── */}
      <div
        id="services"
        className="mx-auto grid max-w-6xl scroll-mt-20 grid-cols-[minmax(0,1fr)] gap-16 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16"
      >
        <div>
          {services.map((s, i) => {
            const text = c.services[s.id];
            const Visual = VISUALS[s.id];
            return (
              <section
                key={s.id}
                id={s.id}
                aria-labelledby={`${s.id}-title`}
                className="border-t border-white/[0.08] py-14 sm:py-16"
              >
                <Reveal>
                  <p className="eyebrow">
                    <span className="text-cool">0{i + 1}</span>
                    {c.kinds[s.kind]}
                  </p>
                  <h2 id={`${s.id}-title`} className="mt-5 text-3xl leading-[1.1] sm:text-4xl">
                    {s.title}
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{text.lead}</p>

                  {text.includes.length > 0 && (
                    <div className="mt-8">
                      <p className={micro}>{c.canInclude}</p>
                      <ul className="mt-4 max-w-2xl border-t border-white/[0.08]">
                        {text.includes.map((item) => (
                          <li
                            key={item}
                            className="border-b border-white/[0.08] py-3.5 text-sm leading-relaxed text-slate-300 sm:text-base"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-10">
                    <Visual c={c} lang={lang} />
                  </div>
                </Reveal>
              </section>
            );
          })}
          <p className="border-t border-white/[0.08] pt-6 text-sm text-slate-400">{c.agreed}</p>
        </div>

        {/* Previous partnerships, sticky on desktop only */}
        <aside
          id="partnerships"
          aria-labelledby="partnerships-title"
          className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pt-6"
        >
          <div className="rounded-[1.5rem] border border-white/10 bg-ink-900 p-6">
            <h2 id="partnerships-title" className="text-2xl leading-[1.15]">
              {c.partnersTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.partnersBody}</p>
            {partnerGroups.map((g) => (
              <div key={g.id} className="mt-4">
                <h3 className={`font-sans ${micro}`}>{c.groups[g.id]}</h3>
                <ul className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
                  {partners
                    .filter((p) => p.group === g.id)
                    .map((p) => (
                      <li key={p.file} title={p.name} className="flex h-12 items-center justify-center bg-ink-900 px-3">
                        <Image
                          src={`/partners/mono/${p.file}`}
                          alt={p.name}
                          width={p.w}
                          height={p.h}
                          className={`${
                            p.w / p.h < 2.8 ? "max-h-9" : "max-h-6"
                          } w-auto max-w-[80%] object-contain opacity-90`}
                        />
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <a href={mailto} className="btn-primary mt-5 w-full">
              <Mail size={16} aria-hidden="true" />
              {c.discuss}
            </a>
          </div>
        </aside>
      </div>

      {/* ── Closing CTA ──────────────────────────────────── */}
      <section aria-labelledby="contact-title" className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-28">
        <Reveal>
          <div className="rounded-[1.75rem] border border-white/10 bg-cool-deep px-6 py-16 text-center sm:px-12 sm:py-20">
            <h2 id="contact-title" className="mx-auto max-w-2xl text-4xl leading-[1.08] sm:text-5xl">
              {c.closingTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-slate-300">{c.closingBody}</p>
            <div className="mt-9 flex flex-col items-center gap-4">
              <a href={mailto} className="btn-primary">
                <Mail size={17} aria-hidden="true" />
                {c.discuss}
              </a>
              <a
                href={mailto}
                className="inline-flex min-h-[44px] items-center text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
              >
                {siteConfig.contactEmail}
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
