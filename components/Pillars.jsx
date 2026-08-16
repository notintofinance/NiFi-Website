import Link from "next/link";
import { Library, GraduationCap, Users, ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

// Three ways to use the site, framed as what a visitor does rather than
// what we offer — replaces the old Services grid (which advertised
// "5+ classes/month" with nowhere for that content to actually live).
export default function Pillars() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading
        number="02"
        eyebrow="Pick a Path"
        title="Three ways to use this site"
        subtitle="Read what we publish, learn the fundamentals, or just come hang out. All three lead back to the same community."
      />

      <div className="mt-14 grid gap-5 md:grid-cols-3 md:grid-rows-2">
        {/* Read — featured, wide */}
        <Link
          href="/hub"
          className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-navy-700/50 to-navy-800/60 p-8 transition-colors hover:border-accent/60 md:col-span-2"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/25 blur-3xl" />
          <div className="relative">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white shadow-glow">
              <Library size={24} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-white">Read</h3>
            <p className="mt-2 max-w-md leading-relaxed text-slate-300">
              Research, articles, newsletter issues, and carousels, all free
              and all in one place. Filter by topic, follow an analyst, or
              just browse what's new.
            </p>
          </div>
          <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-bright">
            Browse the Hub
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </Link>

        {/* Learn — tall, right column */}
        <Link
          href="/learn"
          className="group flex flex-col rounded-3xl border border-navy-600/60 bg-navy-700/40 p-8 transition-colors hover:border-accent/40 md:col-span-1 md:row-span-2"
        >
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
            <GraduationCap size={24} strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold text-white">Learn</h3>
          <p className="mt-2 leading-relaxed text-slate-400">
            Five plain-language primers, from your first investment to how
            to value a company. Start from zero and actually walk away
            understanding it.
          </p>
          <div className="mt-auto pt-8">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-bright">
              Start learning
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </div>
        </Link>

        {/* Belong — wide, bottom */}
        <Link
          href="/community"
          className="group flex min-h-[200px] flex-col justify-between rounded-3xl border border-navy-600/60 bg-navy-700/40 p-8 transition-colors hover:border-accent/40 md:col-span-2"
        >
          <div>
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
              <Users size={24} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-white">Belong</h3>
            <p className="mt-2 max-w-lg leading-relaxed text-slate-400">
              4,600+ people figuring this out together — dinners, meetups,
              and a Discord where no question is too basic.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-bright">
            Meet the community
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </Link>
      </div>
    </section>
  );
}
