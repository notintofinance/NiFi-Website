"use client";

import { useState } from "react";
import ResearchCard from "./ResearchCard";
import { getReportsByDate } from "@/data/research-data";

export default function ResearchGrid() {
  const reports = getReportsByDate();
  const categories = ["All", ...new Set(reports.map((r) => r.category))];
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? reports : reports.filter((r) => r.category === active);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active === cat
                ? "border-accent bg-accent text-white"
                : "border-navy-600 bg-navy-800/60 text-slate-300 hover:border-accent/60 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? "report" : "reports"}
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((report) => (
          <ResearchCard key={report.id} {...report} />
        ))}
      </div>
    </section>
  );
}
