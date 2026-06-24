// Reusable section heading: eyebrow + title + optional subtitle.
// Pass `number` (e.g. "01") for an editorial numbered eyebrow.
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  number,
}) {
  const alignment =
    align === "left"
      ? "text-left items-start"
      : "text-center items-center mx-auto";

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignment}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">
          {number && (
            <>
              <span className="font-mono text-slate-500">{number}</span>
              <span className="h-px w-6 bg-navy-600" />
            </>
          )}
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base leading-relaxed text-slate-400 sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
