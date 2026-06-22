// Reusable section heading: eyebrow + title + optional subtitle.
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}) {
  const alignment =
    align === "left" ? "text-left items-start" : "text-center items-center mx-auto";

  return (
    <div className={`flex flex-col gap-4 max-w-2xl ${alignment}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
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
