import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { getArticlesByDate } from "@/data/article-data";

export const metadata = {
  title: "Articles | Not Into Finance (NiFi)",
  description:
    "Long-form articles from Not Into Finance — markets, macro, and companies explained in plain language, published on X.",
};

export default function ArticlePage() {
  const articles = getArticlesByDate();

  return (
    <>
      <Navbar />
      <main>
        {/* Page header */}
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <span className="eyebrow">Articles</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Our latest articles
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Short, plain-language takes on markets, macro, and the companies
              we&apos;re watching. Each one opens the full article on X.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
