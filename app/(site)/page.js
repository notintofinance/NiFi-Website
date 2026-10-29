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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-cream to-transparent" />
        <div className="pointer-events-none absolute -right-40 -top-24 h-[36rem] w-[36rem] rounded-full bg-cool-soft blur-[120px] opacity-60" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-24">
          {/* Copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-cool" />
              Finance, in plain language
            </span>

            <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-brand sm:text-5xl lg:text-6xl">
              Finance, for people who are not into finance.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Not Into Finance is a community that makes money, markets, and
              investing make sense — learned together, in plain language.
            </p>

            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
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

          {/* Real visual */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-cool-soft to-cream" />
            <figure className="overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
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
              <figcaption className="flex items-center gap-2 px-5 py-3.5 text-sm text-slate-500">
                <Image
                  src="/nifi-mark.png"
                  alt=""
                  width={20}
                  height={16}
                  className="h-4 w-auto"
                />
                A Not Into Finance community meetup
              </figcaption>
            </figure>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
