import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import HeroVideo from "./HeroVideo";
import { siteConfig } from "@/data/site-config";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] items-center justify-center overflow-hidden"
    >
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <HeroVideo />

        {/* Navy gradient + vignette so the bright ink reads as premium navy */}
        <div className="absolute inset-0 bg-navy-950/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-900/55 to-navy-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_25%,_rgba(7,11,26,0.85)_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-28 text-center">
        <Image
          src="/logo-nifi.png"
          alt="Not Into Finance (NiFi) logo"
          width={88}
          height={88}
          priority
          className="mb-8 rounded-2xl ring-1 ring-white/15 shadow-glow"
        />

        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-slate-200 backdrop-blur-sm">
          Research · Education · Community
        </span>

        <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Finance, for people who are{" "}
          <span className="bg-gradient-to-r from-accent-bright to-accent-mint bg-clip-text text-transparent">
            not into finance.
          </span>
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
          A lot of finance content assumes you already get it. We&apos;d like to
          change that. Through research, education, and a community that&apos;s
          happy to answer your questions, we hope to make money and markets a
          little easier to follow, whatever your background.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href={siteConfig.links.community}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-glow transition-colors hover:bg-accent-bright"
          >
            Join Our Community
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
          <a
            href="#about"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            Who We Are
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        aria-label="Scroll to learn more"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-slate-400 transition-colors hover:text-white"
      >
        <ChevronDown size={26} className="animate-bounce" />
      </a>
    </section>
  );
}
