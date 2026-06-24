"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ArticleCard from "./ArticleCard";
import { getArticlesByDate } from "@/data/article-data";

export default function ArticleGrid() {
  const all = getArticlesByDate();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = all.filter(
    (a) =>
      !q ||
      a.title.toLowerCase().includes(q) ||
      (a.summary && a.summary.toLowerCase().includes(q))
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? "article" : "articles"}
        </span>
        <div className="relative w-full max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-lg border border-navy-600 bg-navy-800/60 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-slate-500">
          No articles match your search.
        </p>
      )}
    </section>
  );
}
