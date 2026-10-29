import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { siteConfig } from "@/data/site-config";
import { researchReports, getReportsByDate } from "@/data/research-data";

// Proof is derived from the research library itself, so it stays accurate as
// reports are added.
const reportCount = researchReports.length;
const sectors = [...new Set(researchReports.map((r) => r.category))];
const latestReport = getReportsByDate()[0];
const featuredCovers = getReportsByDate().slice(0, 3);

function CommunityButton({ className = "" }) {
  return (
    <a
      href={siteConfig.links.community}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-primary ${className}`}
    >
      <Image
        src="/discord-logo.png"
        alt=""
        width={24}
        height={24}
        className="h-5 w-5 rounded-[5px]"
      />
      Join the Community
    </a>
  );
}

function ArtharaButton({ className = "" }) {
  return (
    <a
      href={siteConfig.links.arthara}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-secondary ${className}`}
    >
      <Image
        src="/arthara-mark.png"
        alt=""
        width={22}
        height={22}
        className="h-4 w-4 object-contain invert"
      />
      Explore Arthara
      <ArrowUpRight size={15} className="text-slate-500" aria-hidden="true" />
    </a>
  );
}

function Capability({ id, index, label, title, body, link, visual, flip }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="border-t border-white/[0.08] py-20 sm:py-24"
    >
      <Reveal>
        <div
          className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
            flip ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div className="max-w-lg">
            <p className="eyebrow">
              <span className="text-cool">{index}</span>
              {label}
            </p>
            <h3
              id={`${id}-title`}
              className="mt-5 text-4xl leading-[1.08] sm:text-5xl"
            >
              {title}
            </h3>
            <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">
              {body}
            </p>
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="link-arrow mt-7 min-h-[44px]"
            >
              {link.label}
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
          <div>{visual}</div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-6 sm:pt-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Research · Education · Community</p>
            <h1 className="mt-6 text-[3.1rem] leading-[1.02] sm:text-7xl lg:text-[5.5rem]">
              Finance, for people who are{" "}
              <em className="text-cool">not into finance.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-400">
              A research, education, and community space that explains money
              and markets in plain language.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <CommunityButton />
              <ArtharaButton />
            </div>
          </div>

          {/* Editorial hero visual — real NiFi material only */}
          <figure className="mt-16 sm:mt-20">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-800 sm:aspect-[16/9]">
              <Image
                src="/community/activity-ramadan.jpg"
                alt="Members of the Not Into Finance community at a meetup"
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1152px"
                className="object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />

              {/* Research report cover */}
              <div className="absolute bottom-[7%] left-[5%] w-[30%] max-w-[210px] overflow-hidden rounded-lg border border-white/20 shadow-2xl shadow-black/60 sm:w-[19%]">
                <Image
                  src={latestReport.cover}
                  alt={`Cover of the NiFi research report “${latestReport.title}”`}
                  width={707}
                  height={1000}
                  sizes="210px"
                  className="h-auto w-full"
                />
              </div>

              {/* NiFi Journal explainer */}
              <div className="absolute right-[5%] top-[9%] hidden w-[30%] max-w-[330px] overflow-hidden rounded-xl border border-white/20 shadow-2xl shadow-black/60 sm:block">
                <Image
                  src="/content/journal-krisis.jpg"
                  alt="A NiFi Journal explainer post"
                  width={869}
                  height={749}
                  sizes="330px"
                  className="h-auto w-full"
                />
              </div>
            </div>
            <figcaption className="mt-4 text-xs text-slate-400">
              A NiFi community meetup, with one of our research reports and a
              NiFi Journal explainer.
            </figcaption>
          </figure>
        </section>

        {/* ── Proof ────────────────────────────────────────── */}
        <section
          aria-label="Our research"
          className="mx-auto mt-20 max-w-6xl px-5 sm:px-6"
        >
          <div className="grid gap-8 border-y border-white/[0.08] py-10 md:grid-cols-[auto_1fr] md:items-center md:gap-16">
            <div className="flex items-baseline gap-4">
              <span className="font-display text-6xl text-white">{reportCount}</span>
              <span className="max-w-[10rem] text-sm leading-snug text-slate-400">
                research reports published, free to read
              </span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Sectors covered
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                {sectors.map((s) => (
                  <li key={s} className="font-display text-2xl text-slate-200 sm:text-3xl">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Why NiFi ─────────────────────────────────────── */}
        <section
          aria-labelledby="why-title"
          className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32"
        >
          <Reveal>
            <p className="eyebrow">Why NiFi</p>
            <h2
              id="why-title"
              className="mt-6 max-w-4xl text-3xl leading-[1.18] sm:text-5xl sm:leading-[1.12]"
            >
              Most finance content is written for people who already speak
              finance.{" "}
              <span className="text-slate-500">
                We start from zero: plain language, real Indonesian companies,
                and a community where you can ask anything.
              </span>
            </h2>
          </Reveal>
        </section>

        {/* ── Capabilities ─────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <h2 className="sr-only">What NiFi does</h2>
          <Capability
            id="research"
            index="01"
            label="Research"
            title="Research for people who don’t read research."
            body="Equity and sector deep dives on Indonesian companies, written in plain language and free to download."
            link={{
              href: latestReport.file,
              label: `Read “${latestReport.title}”`,
              external: true,
            }}
            visual={
              <div className="relative rounded-[1.75rem] border border-white/10 bg-ink-800 px-6 py-10 sm:px-10">
                <ul className="grid grid-cols-3 gap-3 sm:gap-5">
                  {featuredCovers.map((r, i) => (
                    <li
                      key={r.id}
                      className={`overflow-hidden rounded-lg border border-white/15 shadow-xl shadow-black/50 ${
                        i === 1 ? "sm:-translate-y-4" : ""
                      }`}
                    >
                      <a href={r.file} target="_blank" rel="noopener noreferrer">
                        <Image
                          src={r.cover}
                          alt={`Cover of “${r.title}”`}
                          width={707}
                          height={1000}
                          sizes="(max-width: 1024px) 30vw, 180px"
                          className="h-auto w-full transition-transform duration-300 hover:scale-[1.03]"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            }
          />

          <Capability
            id="education"
            index="02"
            label="Education & Academy"
            title="Explainers first. Academy classes when you want more."
            body="Short posts and videos that explain one idea at a time, plus Academy class sessions that go a level deeper."
            link={{
              href: siteConfig.socials.instagram,
              label: "See our explainers on Instagram",
              external: true,
            }}
            flip
            visual={
              <div className="relative rounded-[1.75rem] border border-white/10 bg-ink-800 p-6 sm:p-10">
                <div className="grid grid-cols-[1.35fr_1fr] items-center gap-4 sm:gap-6">
                  <div className="overflow-hidden rounded-xl border border-white/15 shadow-xl shadow-black/50">
                    <Image
                      src="/content/x-explainer.jpg"
                      alt="A NiFi explainer post on X about air conditioning and productivity"
                      width={1145}
                      height={987}
                      sizes="(max-width: 1024px) 55vw, 300px"
                      className="h-auto w-full"
                    />
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/15 shadow-xl shadow-black/50">
                    <Image
                      src="/content/video-explainer.jpg"
                      alt="A NiFi short video explainer"
                      width={667}
                      height={1081}
                      sizes="(max-width: 1024px) 40vw, 220px"
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              </div>
            }
          />

          <Capability
            id="community"
            index="03"
            label="Community"
            title="A place to ask the questions you were afraid to ask."
            body="Join the Discord to talk markets, share what you’re learning, and meet people at NiFi meetups."
            link={{
              href: siteConfig.links.community,
              label: "Join the Community on Discord",
              external: true,
            }}
            visual={
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-800">
                <Image
                  src="/community/activity-dinner.jpg"
                  alt="NiFi community members together at a dinner meetup"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover object-[50%_60%]"
                />
              </div>
            }
          />
        </div>

        {/* ── Closing CTA ──────────────────────────────────── */}
        <section
          aria-labelledby="cta-title"
          className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-6"
        >
          <Reveal>
            <div className="rounded-[1.75rem] border border-white/10 bg-cool-deep px-6 py-16 text-center sm:px-12 sm:py-20">
              <h2 id="cta-title" className="mx-auto max-w-2xl text-4xl leading-[1.08] sm:text-6xl">
                Finance makes more sense together.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base text-slate-300">
                Start with the community, or explore Arthara.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <CommunityButton />
                <ArtharaButton />
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
