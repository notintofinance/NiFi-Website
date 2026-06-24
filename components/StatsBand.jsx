import { researchReports } from "@/data/research-data";
import { articles } from "@/data/article-data";

export default function StatsBand() {
  const publications = researchReports.length + articles.length;

  const stats = [
    { value: "4,600+", label: "Community members" },
    { value: `${publications}+`, label: "Research & articles" },
    { value: "5+", label: "Free classes / month" },
    { value: "100%", label: "Free to join" },
  ];

  return (
    <section className="border-b border-navy-700/50 bg-navy-900">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-navy-700/50 lg:grid-cols-4 lg:divide-x">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-10 text-center">
            <p className="font-display text-4xl font-bold text-white sm:text-5xl">
              {s.value}
            </p>
            <p className="mt-2 text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
