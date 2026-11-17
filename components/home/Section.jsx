"use client";

import Reveal from "@/components/Reveal";
import { useLang } from "@/components/Lang";

// A page section: a hairline rule across the page (with a small "+" where it
// meets the guide lines), then a header row with the label and title on the
// left and one short line of explanation on the right. Text comes from
// copy.sections[id].
export default function Section({ id, children }) {
  const { t } = useLang();
  const s = t.sections[id];
  const headingId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={headingId} className="relative border-t border-white/[0.07]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 hidden w-full max-w-[76rem] -translate-x-1/2 xl:block"
      >
        <span className="cross -left-[6px] -top-[6px]" />
        <span className="cross -right-[6px] -top-[6px]" />
      </div>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div>
              <p className="micro !text-cool">{s.label}</p>
              <h2 id={headingId} className="mt-3 text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
                {s.title}
              </h2>
            </div>
            {s.rest && (
              <p className="max-w-sm text-base leading-relaxed text-slate-400 lg:pb-1.5">{s.rest}</p>
            )}
          </div>
          <div className="mt-9 sm:mt-12">{children}</div>
        </Reveal>
      </div>
    </section>
  );
}
