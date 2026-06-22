// Reusable pillar/service card. Pass any Lucide icon component via `icon`.
// Optional `index` renders an editorial number (e.g. "01").
export default function ServiceCard({ icon: Icon, title, description, index }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-navy-600/60 bg-navy-700/40 p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-navy-700/70">
      {/* Accent line that reveals on hover */}
      <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-accent to-transparent transition-transform duration-300 group-hover:scale-x-100" />

      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent-bright transition-colors group-hover:bg-accent group-hover:text-white">
          {Icon && <Icon size={24} strokeWidth={2} />}
        </div>
        {index && (
          <span className="text-3xl font-bold text-navy-600 transition-colors group-hover:text-accent/40">
            {index}
          </span>
        )}
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
