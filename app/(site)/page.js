import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { siteConfig } from "@/data/site-config";
import { services, partners } from "@/data/business-data";

function CommunityButton() {
  return (
    <a
      href={siteConfig.links.community}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-primary"
    >
      <Image src="/discord-logo.png" alt="" width={24} height={24} className="h-5 w-5 rounded-[5px]" />
      Join the Community
    </a>
  );
}

function ArtharaButton() {
  return (
    <a
      href={siteConfig.links.arthara}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary"
    >
      <Image src="/arthara-mark.png" alt="" width={22} height={22} className="h-4 w-4 object-contain invert" />
      Explore Arthara
      <ArrowUpRight size={15} className="text-slate-500" aria-hidden="true" />
    </a>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pt-10 sm:px-6 sm:pt-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Research · Education · Community</p>
            <h1 className="mt-6 text-[3.1rem] leading-[1.02] sm:text-7xl lg:text-[5.5rem]">
              Finance, for people who are{" "}
              <em className="text-cool">not into finance.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-400">
              NiFi is a research, education, and community platform that makes
              finance and investing easier to understand. Join the community,
              or go deeper with Arthara.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <CommunityButton />
              <ArtharaButton />
            </div>
          </div>
        </section>

        {/* ── Previous partners: moving logo band ────────── */}
        <section aria-labelledby="partners-title" className="mt-10 sm:mt-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
            <h2
              id="partners-title"
              className="whitespace-nowrap font-sans text-xs font-medium uppercase tracking-[0.2em] text-slate-400"
            >
              Our previous partners
            </h2>
            <Link
              href="/for-business#partnerships"
              className="link-arrow min-h-[44px] whitespace-nowrap"
            >
              <span className="sm:hidden">See all</span>
              <span className="hidden sm:inline">See partnerships</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {/* Two copies of the list on one track; the track slides by half its
              width so the loop is seamless. Hover pauses it; reduced motion
              shows a static, wrapped row instead. */}
          <div className="group mt-3 overflow-hidden border-y border-white/[0.08] py-6 sm:py-8 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:[mask-image:none]">
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

        {/* ── Services preview ─────────────────────────────── */}
        <section
          id="services"
          aria-labelledby="services-title"
          className="mx-auto max-w-6xl px-5 pt-28 sm:px-6 sm:pt-36"
        >
          <Reveal>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Our services</p>
                <h2 id="services-title" className="mt-5 text-4xl leading-[1.08] sm:text-6xl">
                  Work with NiFi.
                </h2>
              </div>
              <Link href="/for-business" className="link-arrow min-h-[44px]">
                All services
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            <ul className="mt-12 grid border-t border-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s, i) => (
                <li
                  key={s.id}
                  className="border-b border-white/[0.08] sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0"
                >
                  <Link
                    href={`/for-business#${s.id}`}
                    className="group flex h-full flex-col py-7 transition-colors hover:bg-white/[0.03] sm:p-7"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      <span className="text-cool">0{i + 1}</span>
                      {s.kind}
                    </span>
                    <span className="mt-8 font-display text-3xl leading-[1.1] text-white">
                      {s.title}
                    </span>
                    <span className="mt-3 text-sm leading-relaxed text-slate-400">{s.short}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium text-white transition-colors group-hover:text-cool">
                      Learn more
                      <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* ── Closing CTA ──────────────────────────────────── */}
        <section aria-labelledby="cta-title" className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-28">
          <Reveal>
            <div className="rounded-[1.75rem] border border-white/10 bg-cool-deep px-6 py-16 text-center sm:px-12 sm:py-20">
              <h2 id="cta-title" className="mx-auto max-w-2xl text-4xl leading-[1.08] sm:text-6xl">
                Finance makes more sense together.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base text-slate-300">
                Join the community, explore Arthara, or bring your brand to NiFi.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <CommunityButton />
                <ArtharaButton />
              </div>
              <Link href="/for-business" className="link-arrow mt-6 min-h-[44px]">
                NiFi for Business
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
