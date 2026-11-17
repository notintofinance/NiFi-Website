"use client";

import Reveal from "@/components/Reveal";
import { useLang } from "@/components/Lang";

// A section with a header row: label and title on the left, one short line
// of explanation on the right. Text comes from copy.sections[id].
//   page    the section opens a page: its title is the <h1> and there is no
//           rule above it
//   action  something for the right side of the header (a link or button)
// Otherwise it is a Home section: an <h2> under a hairline rule that carries
// a small "+" where it meets the page guide lines.
export default function Section({ id, page = false, action, children }) {
  const { t } = useLang();
  const s = t.sections[id];
  const headingId = `${id}-title`;
  const Title = page ? "h1" : "h2";

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`relative scroll-mt-16 ${page ? "" : "border-t border-white/[0.07]"}`}
    >
      {!page && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 hidden w-full max-w-[76rem] -translate-x-1/2 xl:block"
        >
          <span className="cross -left-[6px] -top-[6px]" />
          <span className="cross -right-[6px] -top-[6px]" />
        </div>
      )}
      <div className={`mx-auto max-w-6xl px-5 sm:px-6 ${page ? "pb-16 pt-12 sm:pb-24 sm:pt-16" : "py-16 sm:py-24"}`}>
        <Reveal>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div>
              <p className="micro !text-cool">{s.label}</p>
              <Title
                id={headingId}
                className={`mt-3 leading-[1.1] ${
                  page ? "text-4xl sm:text-5xl lg:text-6xl" : "max-w-2xl text-3xl sm:text-4xl lg:text-[2.75rem]"
                }`}
              >
                {s.title}
              </Title>
            </div>
            {s.rest && (
              <p className="max-w-sm text-base leading-relaxed text-slate-400 lg:pb-1.5">{s.rest}</p>
            )}
            {action}
          </div>
          <div className="mt-9 sm:mt-12">{children}</div>
        </Reveal>
      </div>
    </section>
  );
}
