import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import { getContentByTag, getTagBySlug } from "@/lib/content";

export function generateMetadata({ params }) {
  const tag = getTagBySlug(params.slug);
  const name = tag?.name ?? params.slug;
  return {
    title: `${name} | Not Into Finance (NiFi)`,
    description: `Every report, article, newsletter issue, and carousel tagged "${name}".`,
  };
}

export default function TagPage({ params }) {
  const tag = getTagBySlug(params.slug);
  const items = getContentByTag(params.slug);

  if (!tag) notFound();

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <span className="eyebrow">{tag.type}</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {tag.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Everything we've published tagged "{tag.name}", across research,
              articles, newsletter issues, and carousels.
            </p>
          </div>
        </section>

        <ContentGrid items={items} searchPlaceholder="Search…" />
      </main>
      <Footer />
    </>
  );
}
