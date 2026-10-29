import Image from "next/image";

// NiFi lockup, following the brand's own posters: the aperture mark, a thin
// divider, and a stacked wordmark ("Not Into" small and tracked over
// "Finance"). The mark is the logo's aperture in white for the dark UI.
// The divider and wordmark are spans, so a parent can hide them to show the
// mark alone on small screens.
export default function Logo({ size = 28, withWordmark = true, href = "#top" }) {
  const content = (
    <>
      <Image
        src="/nifi-mark-white.png"
        alt={withWordmark ? "" : "Not Into Finance (NiFi)"}
        width={556}
        height={543}
        priority
        style={{ width: size, height: "auto" }}
      />
      {withWordmark && (
        <>
          <span aria-hidden="true" className="h-7 w-px bg-white/25" />
          <span className="flex flex-col items-end leading-none">
            <span className="text-[8.5px] font-medium uppercase tracking-[0.42em] text-slate-300">
              Not Into
            </span>
            <span className="mt-[3px] text-[19px] font-semibold tracking-tight text-white">
              Finance
            </span>
          </span>
        </>
      )}
    </>
  );

  const label = "Not Into Finance — home";

  if (!href) {
    return <span className="flex items-center gap-3">{content}</span>;
  }

  return (
    <a href={href} aria-label={label} className="flex min-h-[44px] items-center gap-3">
      {content}
    </a>
  );
}
