import {
  MessagesSquare,
  Unlock,
  HeartHandshake,
  Users,
  GraduationCap,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

const principles = [
  {
    icon: MessagesSquare,
    title: "Plain language",
    text: "No jargon for the sake of it. If a term needs explaining, we explain it.",
  },
  {
    icon: Unlock,
    title: "No gatekeeping",
    text: "You don't need a finance degree or a big portfolio to be welcome here.",
  },
  {
    icon: HeartHandshake,
    title: "Learning together",
    text: "We learn as a community, and asking questions out loud is the whole point.",
  },
];

// Who's in the room with you.
const memberTypes = [
  "Investment professionals",
  "Retail traders",
  "Institutional investors",
  "Students",
  "Curious beginners",
];

export default function About() {
  return (
    <section id="about" className="border-y border-navy-700/50 bg-navy-800/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              align="left"
              number="01"
              eyebrow="Who We Are"
              title="We'd like to make finance make sense."
            />
          </div>

          <div className="space-y-5 text-base leading-relaxed text-slate-400 sm:text-lg lg:col-span-7">
            <p>
              Finance has a way of sounding like a private club, full of jargon,
              acronyms, and a tone that quietly says &ldquo;this isn&apos;t for
              you.&rdquo; We started{" "}
              <span className="font-semibold text-white">Not Into Finance</span>{" "}
              because we felt that way too, and thought it could be different.
            </p>
            <p>
              We&apos;re a research, education, and community space that tries to
              take the complicated stuff and explain it the way a normal person
              would. The name says it best. It&apos;s for the people who{" "}
              <span className="text-accent-bright">aren&apos;t</span> into finance
              yet, and just want a place to understand it.
            </p>
          </div>
        </div>

        {/* Community stats */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-navy-600/60 bg-navy-700/40">
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

        {/* Principles */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {principles.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
                <Icon size={22} strokeWidth={2} />
              </div>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
