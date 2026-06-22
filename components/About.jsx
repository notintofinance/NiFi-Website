import { MessagesSquare, Unlock, HeartHandshake } from "lucide-react";
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

export default function About() {
  return (
    <section id="about" className="border-y border-navy-700/50 bg-navy-800/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              align="left"
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
              We&apos;re a small research, education, and community space that
              tries to take the complicated stuff and explain it the way a normal
              person would. The name says it best. It&apos;s for the people who{" "}
              <span className="text-accent-bright">aren&apos;t</span> into finance
              yet, and just want a place to understand it.
            </p>
          </div>
        </div>

        {/* Principles */}
        <div className="mt-16 grid gap-6 border-t border-navy-700/50 pt-12 sm:grid-cols-3">
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
