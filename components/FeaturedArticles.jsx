import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ArticleCard from "./ArticleCard";
import { getArticlesByDate } from "@/data/article-data";

export default function FeaturedArticles() {
  // Three newest articles; full list lives at /article.
  const latest = getArticlesByDate().slice(0, 3);

  return (
    <section className="border-t border-navy-700/50 bg-navy-800/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            number="05"
            eyebrow="Articles"
            title="Fresh from our desk"
            subtitle="Short, plain-language takes on markets, macro, and the companies we're watching."
          />
          <Link
            href="/article"
            className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-navy-600 bg-navy-800/60 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-accent hover:text-white"
          >
            View all articles
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </div>
    </section>
  );
}
