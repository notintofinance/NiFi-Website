import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site-config";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-white px-6">
        {/* Warm editorial wash */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-cream to-transparent" />

        <div className="relative mx-auto max-w-3xl py-20 text-center">
          <span className="inline-block rounded-full border border-line bg-cream px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Finance, in plain language
          </span>

          <h1 className="mt-7 font-display text-4xl font-bold leading-[1.08] tracking-tight text-brand sm:text-5xl md:text-6xl">
            Finance, for people who are not into finance.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Not Into Finance explains money and markets in plain language, and
            brings people together to learn it as a community.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <a
              href={siteConfig.links.community}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover sm:w-auto"
            >
              Join the Community
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
