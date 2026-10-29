import Image from "next/image";
import { Mail, ArrowDown, ArrowUpRight, Check, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { siteConfig } from "@/data/site-config";
import {
  services,
  partners,
  academyIncubation,
  academyClasses,
} from "@/data/business-data";

export const metadata = {
  title: "For Business | Not Into Finance (NiFi)",
  description:
    "Brand placement, event and community activation, NiFi Academy and Arthara: ways for brands and organizations to collaborate with Not Into Finance.",
  openGraph: {
    title: "For Business | Not Into Finance (NiFi)",
    description:
      "Brand placement, event and community activation, NiFi Academy and Arthara: ways to collaborate with Not Into Finance.",
    url: "https://notintofinance.com/for-business",
    type: "website",
  },
};

const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
  "Partnership with Not Into Finance"
)}`;

// Real NiFi material shown beside each service.
function Shot({ src, w, h, alt, caption, className = "", imgClassName = "h-auto w-full" }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-xl border border-white/15 bg-ink-800">
        <Image
          src={src}
          alt={alt}
          width={w}
          height={h}
          sizes="(max-width: 1024px) 50vw, 320px"
          className={imgClassName}
        />
      </div>
      <figcaption className="mt-2.5 text-xs text-slate-400">{caption}</figcaption>
    </figure>
  );
}

const brandPlacement = services.find((s) => s.id === "brand-placement");

const visuals = {
  "brand-placement": (
    <>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        Placement formats
      </p>
      <ol className="mt-4 grid gap-4 sm:grid-cols-2">
        {brandPlacement.formats.map((f, i) => (
          <li
            key={f.name}
            className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900"
          >
            <figure className="border-b border-white/10">
              <Image
                src={f.example.src}
                alt={f.example.alt}
                width={f.example.w}
                height={f.example.h}
                sizes="(max-width: 640px) 100vw, 340px"
                className="aspect-[4/3] h-auto w-full object-cover object-top"
              />
              <figcaption className="sr-only">{f.example.caption}</figcaption>
            </figure>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-cool">
                Format 0{i + 1}
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
              <p className="mt-auto pt-5 text-xs text-slate-400">{f.example.caption}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 px-5 py-4 text-sm text-slate-300">
        <Plus size={16} className="flex-none text-cool" aria-hidden="true" />
        <span>
          <span className="font-medium text-white">Add-on · </span>
          {brandPlacement.addOn}
        </span>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-400">
        Examples are NiFi’s own research-led posts, the style placements
        follow. They are not sponsored.
      </p>
    </>
  ),
  events: (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <Shot
        src="/community/activity-ramadan.jpg"
        w={1600}
        h={1200}
        alt="Members of the NiFi community together at a meetup"
        caption="NiFi community meetup"
        imgClassName="aspect-[4/3] h-auto w-full object-cover"
      />
      <Shot
        src="/community/nifiberbagi-1.jpg"
        w={1600}
        h={900}
        alt="NiFi volunteers at a #NiFiBerbagi charity activity, with faces covered for privacy"
        caption="#NiFiBerbagi charity activity"
        imgClassName="aspect-[4/3] h-auto w-full object-cover"
      />
    </div>
  ),
  academy: (
    <div className="space-y-10">
      {/* Incubation program */}
      <div className="grid items-center gap-6 rounded-2xl border border-white/10 bg-ink-900 p-5 sm:grid-cols-[0.8fr_1fr] sm:p-6">
        <div className="overflow-hidden rounded-xl border border-white/15">
          <Image
            src={`/content/academy/${academyIncubation.file}`}
            alt="Poster for the NiFi Academy Incubation program “Research to Win”"
            width={academyIncubation.w}
            height={academyIncubation.h}
            sizes="(max-width: 640px) 100vw, 300px"
            className="h-auto w-full"
          />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Program · {academyIncubation.period}
          </p>
          <h3 className="mt-3 text-2xl leading-[1.15] sm:text-3xl">
            {academyIncubation.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {academyIncubation.summary}
          </p>
          <ol className="mt-5 border-t border-white/[0.08]">
            {academyIncubation.steps.map((step, i) => (
              <li
                key={step}
                className="flex gap-3 border-b border-white/[0.08] py-2.5 text-sm text-slate-300"
              >
                <span className="text-cool">0{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Past online classes */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Past online class sessions
        </p>
        <div
          role="region"
          aria-label="Past NiFi online class sessions"
          tabIndex={0}
          className="mt-4 overflow-x-auto"
        >
          <ul className="flex w-max gap-4 pb-3">
            {academyClasses.map((c) => (
              <li key={c.file} className="w-[150px] flex-none sm:w-[168px]">
                <div className="overflow-hidden rounded-lg border border-white/15">
                  <Image
                    src={`/content/academy/${c.file}`}
                    alt={`Poster for the NiFi class “${c.title}” with ${c.speaker}`}
                    width={c.w}
                    height={c.h}
                    sizes="170px"
                    className="aspect-[4/5] h-auto w-full object-cover object-top"
                  />
                </div>
                <p className="mt-2.5 line-clamp-2 text-xs font-medium leading-snug text-slate-200">
                  {c.title}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {c.speaker} · {c.date}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  ),
  arthara: (
    <div className="flex flex-col items-start gap-6 rounded-2xl border border-white/10 bg-ink-900 p-7 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-ink-800">
          <Image src="/arthara-mark.png" alt="" width={32} height={32} className="h-7 w-7 object-contain invert" />
        </span>
        <div>
          <p className="text-base font-semibold text-white">Arthara</p>
          <p className="text-sm text-slate-400">arthara.id</p>
        </div>
      </div>
      <a
        href={siteConfig.links.arthara}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary"
      >
        Explore Arthara
        <ArrowUpRight size={15} className="text-slate-500" aria-hidden="true" />
      </a>
    </div>
  ),
};

export default function ForBusiness() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
          <div className="max-w-3xl">
            <p className="eyebrow">For Business</p>
            <h1 className="mt-6 text-[3rem] leading-[1.03] sm:text-7xl">
              Open for <em className="text-cool">collaboration.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-400">
              NiFi works with brands and organizations to reach people who follow
              finance and investing — through our content, events, Academy and
              Arthara.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href={mailto} className="btn-primary">
                <Mail size={17} aria-hidden="true" />
                Discuss a partnership
              </a>
              <a href="#services" className="btn-secondary">
                See services
                <ArrowDown size={15} className="text-slate-500" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* On this page */}
          <nav aria-label="Services on this page" className="mt-16 border-t border-white/[0.08]">
            <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s, i) => (
                <li key={s.id} className="border-b border-white/[0.08] lg:border-b-0">
                  <a
                    href={`#${s.id}`}
                    className="flex min-h-[56px] items-center gap-3 py-4 pr-4 text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <span className="text-cool">0{i + 1}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        {/* ── Services + Previous Partnerships ─────────────── */}
        <div
          id="services"
          className="mx-auto grid max-w-6xl scroll-mt-20 grid-cols-[minmax(0,1fr)] gap-16 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16"
        >
          {/* Services, one by one */}
          <div>
            {services.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                aria-labelledby={`${s.id}-title`}
                className="border-t border-white/[0.08] py-14 sm:py-16"
              >
                <Reveal>
                  <p className="eyebrow">
                    <span className="text-cool">0{i + 1}</span>
                    {s.kind}
                  </p>
                  <h2 id={`${s.id}-title`} className="mt-5 text-4xl leading-[1.08] sm:text-5xl">
                    {s.title}
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                    {s.lead}
                  </p>

                  {s.includes.length > 0 && (
                    <div className="mt-8">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                        Can include
                      </p>
                      <ul className="mt-4 max-w-2xl border-t border-white/[0.08]">
                        {s.includes.map((item) => (
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

                  <div className="mt-10">{visuals[s.id]}</div>
                </Reveal>
              </section>
            ))}
            <p className="border-t border-white/[0.08] pt-6 text-sm text-slate-400">
              Formats, scope and deliverables are agreed for each collaboration.
            </p>
          </div>

          {/* Previous partnerships — sticky on desktop only */}
          <aside
            id="partnerships"
            aria-labelledby="partnerships-title"
            className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pt-6"
          >
            <div className="rounded-[1.5rem] border border-white/10 bg-ink-900 p-6">
              <h2 id="partnerships-title" className="text-3xl leading-[1.1]">
                Previous Partnerships
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Organizations NiFi has collaborated with. Collaboration types
                varied; roles are noted where documented.
              </p>
              <ul className="mt-5 border-t border-white/[0.08]">
                {partners.map((p) => (
                  <li
                    key={p.file}
                    className="flex items-center gap-4 border-b border-white/[0.08] py-2.5"
                  >
                    <span className="flex h-9 w-24 flex-none items-center justify-center">
                      <Image
                        src={`/partners/mono/${p.file}`}
                        alt=""
                        width={p.w}
                        height={p.h}
                        className="max-h-7 w-auto max-w-full object-contain opacity-90"
                      />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-white">{p.name}</span>
                      <span className="block text-xs text-slate-400">{p.relation}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <a href={mailto} className="btn-primary mt-5 w-full">
                <Mail size={16} aria-hidden="true" />
                Discuss a partnership
              </a>
            </div>
          </aside>
        </div>

        {/* ── Closing CTA ──────────────────────────────────── */}
        <section aria-labelledby="contact-title" className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-28">
          <Reveal>
            <div className="rounded-[1.75rem] border border-white/10 bg-cool-deep px-6 py-16 text-center sm:px-12 sm:py-20">
              <h2 id="contact-title" className="mx-auto max-w-2xl text-4xl leading-[1.08] sm:text-6xl">
                Let’s collaborate.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base text-slate-300">
                Tell us about your brand or organization and what you have in
                mind. We’ll reply by email.
              </p>
              <div className="mt-9 flex flex-col items-center gap-4">
                <a href={mailto} className="btn-primary">
                  <Mail size={17} aria-hidden="true" />
                  Discuss a partnership
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
      <Footer />
    </>
  );
}
