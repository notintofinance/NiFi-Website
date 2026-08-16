import { Users, GraduationCap, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Activities from "@/components/Activities";
import PhotoCard from "@/components/PhotoCard";
import Testimonials from "@/components/Testimonials";
import { siteConfig } from "@/data/site-config";

export const metadata = {
  title: "Community | Not Into Finance (NiFi)",
  description:
    "4,600+ members figuring out finance together — who's in the room, what we get up to, and how to join.",
};

const memberTypes = [
  "Investment professionals",
  "Retail traders",
  "Institutional investors",
  "Students",
  "Curious beginners",
];

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Page header */}
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <span className="eyebrow">Community</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              A room full of people figuring this out together
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              4,600+ members, one shared rule: no question is too basic, and
              nobody's made to feel behind.
            </p>
          </div>
        </section>

        {/* Stats + who's in the room */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="overflow-hidden rounded-3xl border border-navy-600/60 bg-navy-700/40">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-4 border-navy-600/60 p-8 sm:border-r">
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
                  <Users size={24} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">4,600+</p>
                  <p className="text-sm text-slate-400">Community members</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-navy-600/60 p-8 lg:border-r">
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
                  <GraduationCap size={24} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">5+</p>
                  <p className="text-sm text-slate-400">
                    Free classes, held monthly
                  </p>
                </div>
              </div>

              <div className="border-t border-navy-600/60 p-8 sm:col-span-2 lg:col-span-1 lg:border-t-0">
                <p className="mb-3 text-sm font-medium text-slate-300">
                  A real mix of people:
                </p>
                <div className="flex flex-wrap gap-2">
                  {memberTypes.map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-navy-600 bg-navy-800/60 px-3 py-1 text-xs text-slate-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* #NiFiBerbagi */}
        <section className="border-y border-navy-700/50 bg-navy-800/40">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <Activities />
          </div>
        </section>

        {/* Community life gallery */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-bright">
              <Sparkles size={14} />
              Community life
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              It's not all charts and reports
            </h2>
            <p className="max-w-xl leading-relaxed text-slate-400">
              Dinners, meetups, and the odd Gundam build — the parts of the
              community that don't show up in a research report.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <PhotoCard
              src="/community/activity-dinner.jpg"
              alt="NiFi community members at a group dinner"
              caption="Team dinner"
              className="aspect-video"
            />
            <PhotoCard
              src="/community/activity-ramadan.jpg"
              alt="NiFi community members at a Ramadan gathering"
              caption="Ramadan gathering"
              className="aspect-video"
            />
            <PhotoCard
              src="/community/activity-gundam-1.jpg"
              alt="NiFi community members building Gundam model kits together"
              caption="Gundam build night"
              className="aspect-video"
            />
            <PhotoCard
              src="/community/activity-gundam-2.jpg"
              alt="NiFi community members building Gundam model kits together"
              caption="Gundam build night, part two"
              className="aspect-video"
            />
          </div>
        </section>

        <Testimonials />

        {/* Join CTA */}
        <section className="border-t border-navy-700/50 bg-navy-800/40">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <a
              href={siteConfig.links.community}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/20 via-navy-700/60 to-navy-800/70 p-10 transition-colors hover:border-accent/60 sm:flex-row sm:items-center"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white shadow-glow">
                  <Users size={22} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Come see for yourself
                </h3>
                <p className="mt-2 max-w-md leading-relaxed text-slate-300">
                  Join the Discord — it's free, and it's the fastest way to
                  see what this community actually feels like.
                </p>
              </div>
              <span className="relative inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-accent-bright">
                Join the Discord
              </span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
