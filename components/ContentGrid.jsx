"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ContentCard from "./ContentCard";

const TYPE_LABELS = {
  researchReport: "Research",
  article: "Articles",
  newsletterIssue: "Newsletter",
  carousel: "Carousels",
};

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-accent bg-accent text-white"
          : "border-navy-600 bg-navy-800/60 text-slate-300 hover:border-accent/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// Generic grid for all hub content: search + an optional content-type filter
// (only shown when `items` spans more than one type, e.g. on /hub) + an
// optional tag filter (shown whenever the items carry tags).
export default function ContentGrid({ items, searchPlaceholder = "Search…" }) {
  const [activeType, setActiveType] = useState("All");
  const [activeTag, setActiveTag] = useState("All");
  const [query, setQuery] = useState("");

  const types = useMemo(() => {
    const present = [...new Set(items.map((i) => i._type))];
    return present.length > 1 ? present : null;
  }, [items]);

  const tags = useMemo(() => {
    const map = new Map();
    items.forEach((i) => (i.tags || []).forEach((t) => map.set(t.slug, t)));
    return map.size > 0 ? Array.from(map.values()) : null;
  }, [items]);

  const q = query.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchesType = !types || activeType === "All" || item._type === activeType;
    const matchesTag =
      !tags ||
      activeTag === "All" ||
      (item.tags || []).some((t) => t.slug === activeTag);
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.summary && item.summary.toLowerCase().includes(q)) ||
      (item.authors && item.authors.join(" ").toLowerCase().includes(q)) ||
      (item.tags || []).some((t) => t.name.toLowerCase().includes(q));
    return matchesType && matchesTag && matchesQuery;
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {types ? (
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={activeType === "All"} onClick={() => setActiveType("All")}>
              All
            </FilterChip>
            {types.map((t) => (
              <FilterChip key={t} active={activeType === t} onClick={() => setActiveType(t)}>
                {TYPE_LABELS[t] ?? t}
              </FilterChip>
            ))}
          </div>
        ) : (
          <span className="text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        )}

        <div className="relative sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-navy-600 bg-navy-800/60 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {tags && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FilterChip active={activeTag === "All"} onClick={() => setActiveTag("All")}>
            All tags
          </FilterChip>
          {tags.map((t) => (
            <FilterChip
              key={t.slug}
              active={activeTag === t.slug}
              onClick={() => setActiveTag(t.slug)}
            >
              {t.name}
            </FilterChip>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ContentCard key={item._id} {...item} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-slate-500">
          Nothing matches your search yet.
        </p>
      )}
    </section>
  );
}
