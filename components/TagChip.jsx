import Link from "next/link";

// Small pill linking to the unified /tag/[slug] page. Stops propagation so it
// can sit inside a card that's itself a click target (opens a preview modal).
export default function TagChip({ tag, size = "sm" }) {
  if (!tag?.slug) return null;

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <Link
      href={`/tag/${tag.slug}`}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center rounded-full border border-navy-600 bg-navy-800/80 font-medium text-slate-400 transition-colors hover:border-accent/60 hover:text-accent-bright ${sizeClasses}`}
    >
      {tag.name}
    </Link>
  );
}
