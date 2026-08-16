import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessagesSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";
import TagChip from "@/components/TagChip";
import { learnTopics, getLearnTopicBySlug } from "@/data/learn-data";
import { getContentByTag } from "@/lib/content";
import { siteConfig } from "@/data/site-config";

export function generateStaticParams() {
  return learnTopics.map((t) => ({ slug: t.id }));
}

export function generateMetadata({ params }) {
  const topic = getLearnTopicBySlug(params.slug);
  if (!topic) return {};
  return {
    title: `${topic.title} | Learn | Not Into Finance (NiFi)`,
    description: topic.summary,
  };
}

export default function LearnTopicPage({ params }) {
  const topic = getLearnTopicBySlug(params.slug);
  if (!topic) notFound();

  const relatedTag = topic.tags?.[0];
  const related = relatedTag ? getContentByTag(relatedTag.slug) : [];

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-24">
            <span className="eyebrow">Learn</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {topic.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              {topic.summary}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="space-y-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            {topic.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-navy-700/50 pt-8">
            <span className="text-sm text-slate-500">Tagged:</span>
            {topic.tags.map((tag) => (
              <TagChip key={tag.slug} tag={tag} size="md" />
            ))}
          </div>

          <a
            href={siteConfig.links.community}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 flex items-center gap-4 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 via-navy-700/50 to-navy-800/60 p-6 transition-colors hover:border-accent/60"
          >
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-glow">
              <MessagesSquare size={22} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">
                Want to go deeper or ask questions?
              </p>
              <p className="mt-0.5 text-sm text-slate-400">
                Join the conversation on Discord — no question is too basic.
              </p>
            </div>
            <ArrowRight
              size={20}
              className="shrink-0 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-accent-bright"
            />
          </a>
        </section>

        {related.length > 0 && (
          <section className="border-t border-navy-700/50 bg-navy-800/40">
            <div className="mx-auto max-w-7xl px-6 py-16">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                From the Hub, tagged {relatedTag.name}
              </h2>
              <p className="mt-2 max-w-2xl text-slate-400">
                Research and articles that put this topic into practice.
              </p>
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <ContentCard key={item._id} {...item} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-3xl px-6 py-10 text-center">
          <Link
            href="/learn"
            className="text-sm font-semibold text-accent-bright hover:text-white"
          >
            ← Back to Learn
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
