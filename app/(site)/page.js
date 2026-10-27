import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site-config";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6">
        {/* Soft glow backdrop */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[140px]" />

        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            Finance, for people who are{" "}
            <span className="text-accent-bright">not into finance.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Not Into Finance explains money and markets in plain language, and
            brings people together to learn it as a community.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={siteConfig.links.community}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-accent-bright sm:w-auto"
            >
              Join the Community
            </a>
            <a
              href={siteConfig.links.arthara}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-navy-600 bg-navy-800/60 px-7 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:border-accent hover:text-white sm:w-auto"
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
