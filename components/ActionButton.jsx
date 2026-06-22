import { ArrowUpRight } from "lucide-react";

// Reusable action card used by the Action Hub.
// All cards share one consistent navy tone for a clean, professional look.
export default function ActionButton({
  icon: Icon,
  label,
  description,
  href,
  external = false,
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex flex-col gap-4 rounded-2xl border border-navy-600/60 bg-navy-700/40 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-navy-700/70"
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent-bright transition-colors group-hover:bg-accent group-hover:text-white">
          {Icon && <Icon size={24} strokeWidth={2} />}
        </div>
        <ArrowUpRight
          size={20}
          className="text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-bright"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
          {description}
        </p>
      </div>
    </a>
  );
}
