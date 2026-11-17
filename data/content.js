// Real research reports (PDF) and articles (on X), newest first, in the
// shape the research explorer uses. Titles stay as published; the one-line
// summaries exist in both languages (data/home-data.js).
import { researchReports } from "./research-data";
import { articles } from "./article-data";
import { contentMeta } from "./home-data";

const meta = (id, fallback) => ({
  topics: contentMeta[id]?.topics ?? ["other"],
  summary: { id: contentMeta[id]?.id ?? fallback, en: contentMeta[id]?.en ?? fallback },
});

export const content = [
  ...researchReports.map((r) => ({
    id: r.id,
    type: "research",
    title: r.title,
    date: r.date,
    href: r.file,
    cover: r.cover,
    ...meta(r.id, r.summary),
  })),
  ...articles.map((a) => ({
    id: a.id,
    type: "article",
    title: a.title,
    date: a.date,
    href: a.url,
    ...meta(a.id, a.summary),
  })),
].sort((a, b) => b.date.localeCompare(a.date));


