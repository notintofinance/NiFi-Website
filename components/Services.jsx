import Link from "next/link";
import { FileSearch, GraduationCap, Users, ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

const eduTopics = ["Valuation", "Macro", "Risk", "Markets", "Investing 101"];

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading
        eyebrow="What We Do"
        title="Three ways we hope to help"
        subtitle="Research, education, and community. Three sides of the same goal: helping more people feel at home with finance."
      />

      <div className="mt-14 grid gap-5 md:grid-cols-3 md:grid-rows-2">
        {/* Research — featured, wide */}
        <Link
          href="/research"
          className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-navy-700/50 to-navy-800/60 p-8 transition-colors hover:border-accent/60 md:col-span-2"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/25 blur-3xl" />
          <div className="relative">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white shadow-glow">
              <FileSearch size={24} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-white">Research</h3>
            <p className="mt-2 max-w-md leading-relaxed text-slate-300">
              Honest, readable research on companies and markets. We do the
              digging and try to lay it out clearly, without the walls of jargon.
            </p>
          </div>
          <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-bright">
            Browse the library
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </Link>

        {/* Education — tall, right column */}
        <div className="flex flex-col rounded-3xl border border-navy-600/60 bg-navy-700/40 p-8 transition-colors hover:border-accent/40 md:col-span-1 md:row-span-2">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
            <GraduationCap size={24} strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold text-white">Education</h3>
          <p className="mt-2 leading-relaxed text-slate-400">
            The big finance ideas, broken down step by step. Start from zero and
            actually walk away understanding it.
          </p>
          <div className="mt-auto pt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Topics we cover
            </p>
            <div className="flex flex-wrap gap-2">
              {eduTopics.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-navy-600 bg-navy-800/60 px-3 py-1 text-xs text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Community — wide, bottom */}
        <div className="flex min-h-[200px] flex-col justify-between rounded-3xl border border-navy-600/60 bg-navy-700/40 p-8 transition-colors hover:border-accent/40 md:col-span-2">
          <div>
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
              <Users size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-white">Community</h3>
            <p className="mt-2 max-w-lg leading-relaxed text-slate-400">
              A friendly room full of people figuring this out together. A place
              to ask, share, learn, and grow your confidence along the way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
