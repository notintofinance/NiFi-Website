import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site-config";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden bg-white">
        {/* Cool background wash */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-cream to-transparent" />
        <div className="pointer-events-none absolute -right-40 -top-24 h-[36rem] w-[36rem] rounded-full bg-cool-soft opacity-70 blur-[120px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-16 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:pb-28 lg:pt-28">
          {/* Copy */}
          <div>
            <span className="eyebrow-pill">
              <span className="h-1.5 w-1.5 rounded-full bg-cool" />
              Finance, in plain language
            </span>

            <h1 className="mt-7 font-display text-[2.75rem] font-bold leading-[1.02] tracking-[-0.03em] text-brand sm:text-6xl lg:text-[4.25rem]">
              Finance, for people who are{" "}
              <span className="text-cool">not into finance.</span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-relaxed text-slate-600">
              We explain money and markets in plain language, then learn them
              together as a community. No jargon. No hype.
            </p>

            <div className="mt-10 flex flex-col gap-3.5 sm:flex-row">
              <a
                href={siteConfig.links.community}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-hover"
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
              <a
                href={siteConfig.links.arthara}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-line bg-white px-7 py-3.5 text-sm font-semibold text-brand transition-colors hover:border-brand"
              >
                <Image
                  src="/arthara-mark.png"
                  alt=""
                  width={22}
                  height={22}
                  className="h-4 w-4 object-contain"
                />
                Explore Arthara
                <ArrowUpRight size={15} className="text-slate-400" />
              </a>
            </div>
          </div>

          {/* Framed real visual with layered cards */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.25rem] bg-gradient-to-tr from-cool-soft via-cream to-white" />

            <figure className="overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-lift">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/community/activity-ramadan.jpg"
                  alt="Members of the Not Into Finance community together at a meetup"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  priority
                />
              </div>
            </figure>

            {/* Floating label card: descriptive, not a statistic */}
            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-line bg-white/95 p-4 shadow-lift backdrop-blur sm:left-auto sm:right-6 sm:w-[17.5rem]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand">
                  <Image
                    src="/nifi-mark.png"
                    alt=""
                    width={22}
                    height={18}
                    className="h-4 w-auto brightness-0 invert"
                  />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand">Academy · Research · Community</p>
                  <p className="text-xs text-slate-500">Learn finance the way it makes sense.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
