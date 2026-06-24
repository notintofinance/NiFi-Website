import { Quote } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { testimonials } from "@/data/testimonials-data";

// Not currently rendered — add <Testimonials /> to app/page.js when you
// have real member quotes to show.
export default function Testimonials() {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading
        eyebrow="Community"
        title="What our members say"
        subtitle="Real voices from a community of 4,600+ learners, traders, and professionals."
      />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <figure
            key={i}
            className="flex flex-col rounded-2xl border border-navy-600/60 bg-navy-700/40 p-7"
          >
            <Quote size={26} className="text-accent-bright" />
            <blockquote className="mt-4 flex-1 text-base leading-relaxed text-slate-200">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 border-t border-navy-700/60 pt-4">
              <p className="text-sm font-semibold text-white">{t.name}</p>
              <p className="text-xs text-slate-400">{t.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
