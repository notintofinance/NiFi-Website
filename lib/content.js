import { researchReports } from "@/data/research-data";
import { articles } from "@/data/article-data";
import { newsletterIssues } from "@/data/newsletter-data";
import { carouselPosts } from "@/data/carousel-data";
import { TAGS } from "@/data/tags-data";

// Normalizes every content type to the same shape so one set of
// components (ContentCard / ContentGrid) can render all of them.
//   cover — a single image url (carousels use their first slide)
//   href  — the single outbound/primary link (PDF, X post, Beehiiv issue,
//           or IG/X post)
function normalize(_type, item) {
  const hrefByType = {
    researchReport: item.file,
    article: item.url,
    newsletterIssue: item.url,
    carousel: item.sourceUrl,
  };
  const coverByType = {
    researchReport: item.cover,
    article: item.cover,
    newsletterIssue: item.cover,
    carousel: item.slides?.[0],
  };

  return {
    _id: item.id,
    _type,
    title: item.title,
    date: item.date,
    summary: item.summary,
    brief: item.brief,
    authors: item.authors,
    cover: coverByType[_type],
    href: hrefByType[_type],
    tags: item.tags ?? [],
  };
}

const SOURCES = {
  researchReport: researchReports,
  article: articles,
  newsletterIssue: newsletterIssues,
  carousel: carouselPosts,
};

const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);

export function getAllContent() {
  return Object.entries(SOURCES)
    .flatMap(([type, items]) => items.map((item) => normalize(type, item)))
    .sort(byDateDesc);
}

export function getContentByType(type) {
  return (SOURCES[type] ?? [])
    .map((item) => normalize(type, item))
    .sort(byDateDesc);
}

export function getContentByTag(slug) {
  return getAllContent().filter((item) =>
    item.tags.some((t) => t.slug === slug)
  );
}

export function getTagBySlug(slug) {
  return Object.values(TAGS).find((t) => t.slug === slug) ?? null;
}

const slugifyName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

// Analysts aren't a separate content type — they're derived from the
// `authors` byline already on every research report, so there's nothing
// new to keep in sync when a report is added.
export function getAllAnalysts() {
  const bySlug = new Map();
  for (const report of researchReports) {
    for (const name of report.authors ?? []) {
      const slug = slugifyName(name);
      if (!bySlug.has(slug)) bySlug.set(slug, { name, slug, reportCount: 0 });
      bySlug.get(slug).reportCount += 1;
    }
  }
  return Array.from(bySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function getAnalystBySlug(slug) {
  const analyst = getAllAnalysts().find((a) => a.slug === slug);
  if (!analyst) return null;

  const reports = researchReports
    .filter((r) => (r.authors ?? []).some((n) => slugifyName(n) === slug))
    .map((r) => normalize("researchReport", r))
    .sort(byDateDesc);

  return { ...analyst, reports };
}
