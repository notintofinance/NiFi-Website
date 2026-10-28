import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site-config";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-white px-6">
        {/* Editorial background: warm wash + faint brand aperture */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-gradient-to-b from-cream to-transparent" />
        <Image
          src="/nifi-mark.png"
          alt=""
          width={1024}
          height={798}
          priority
          className="pointer-events-none absolute -right-24 -top-10 w-[34rem] max-w-none opacity-[0.045] md:right-[-6rem]"
        />

        <div className="relative mx-auto max-w-3xl py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Finance, in plain language
          </span>

          <h1 className="mt-7 font-display text-[2.6rem] font-bold leading-[1.06] tracking-tight text-brand sm:text-6xl">
            Finance, for people who are{" "}
            <span className="relative whitespace-nowrap">
              not into finance.
              <svg
                aria-hidden="true"
                viewBox="0 0 320 20"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-[0.5em] w-full text-gold"
              >
                <path
                  d="M4 13 C 70 5, 150 5, 316 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-slate-600">
            Not Into Finance makes money, markets, and investing make sense — in
            plain language, learned together as a community.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <a
              href={siteConfig.links.community}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-hover sm:w-auto"
            >
              Join the Community
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
            <a
              href={siteConfig.links.arthara}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-7 py-3.5 text-sm font-semibold text-brand transition-colors hover:border-brand sm:w-auto"
            >
              Explore Arthara
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
