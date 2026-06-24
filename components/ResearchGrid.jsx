"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ResearchCard from "./ResearchCard";
import { getReportsByDate } from "@/data/research-data";

export default function ResearchGrid() {
  const reports = getReportsByDate();
  const categories = ["All", ...new Set(reports.map((r) => r.category))];
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = reports.filter((r) => {
    const matchesCat = active === "All" || r.category === active;
    const matchesQuery =
      !q ||
      r.title.toLowerCase().includes(q) ||
      (r.summary && r.summary.toLowerCase().includes(q)) ||
      (r.authors && r.authors.join(" ").toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research…"
            className="w-full rounded-lg border border-navy-600 bg-navy-800/60 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => (
            <ResearchCard key={report.id} {...report} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-slate-500">
          No research matches your search.
        </p>
      )}
    </section>
  );
}
