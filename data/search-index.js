// =============================================================
//  Search index for the command palette (⌘K / "Cari").
//  Built per language from the same real data files the pages
//  use; nothing is fetched and nothing is sent anywhere. This is
//  plain text matching, not an AI answer.
// =============================================================

import { researchReports } from "./research-data";
import { articles } from "./article-data";
import { academyClasses, services } from "./business-data";
import { getJargon, getPrimers, contentMeta, businessShort } from "./home-data";
import { siteConfig } from "./site-config";
import { copy } from "./copy";

export function buildIndex(lang) {
  const p = copy[lang].palette;
  const topicLabel = copy[lang].research.topics;
  const entry = (key) => ({ title: p.entries[key][0], sub: p.entries[key][1] });
  const summary = (id, fallback) => contentMeta[id]?.[lang] ?? fallback;
  const topicWords = (id) => (contentMeta[id]?.topics ?? []).map((k) => topicLabel[k]).join(" ");

  const entries = [
    // Where to go
    { id: "nav-lab", group: p.groups.nav, ...entry("lab"), href: "/#lab" },
    { id: "nav-research", group: p.groups.nav, ...entry("research"), href: "/#research" },
    { id: "nav-learn", group: p.groups.nav, ...entry("learn"), href: "/#belajar" },
    { id: "nav-community", group: p.groups.nav, ...entry("community"), href: "/#komunitas" },
    { id: "nav-business", group: p.groups.nav, ...entry("business"), href: "/for-business" },

    // Things to do
    { id: "act-discord", group: p.groups.action, ...entry("discord"), href: siteConfig.links.community, external: true },
    { id: "act-arthara", group: p.groups.action, ...entry("arthara"), href: siteConfig.links.arthara, external: true },
    { id: "act-email", group: p.groups.action, title: p.entries.email[0], sub: siteConfig.contactEmail, href: `mailto:${siteConfig.contactEmail}` },

    // Research reports (PDF) and articles (on X)
    ...researchReports.map((r) => ({
      id: `r-${r.id}`,
      group: p.groups.content,
      title: r.title,
      sub: summary(r.id, r.summary),
      tag: p.tags.report,
      href: r.file,
      external: true,
      keywords: topicWords(r.id),
    })),
    ...articles.map((a) => ({
      id: `a-${a.id}`,
      group: p.groups.content,
      title: a.title,
      sub: summary(a.id, a.summary),
      tag: p.tags.article,
      href: a.url,
      external: true,
      keywords: topicWords(a.id),
    })),

    // Beginner primers and past classes
    ...getPrimers(lang).map((primer) => ({
      id: `p-${primer.id}`,
      group: p.groups.primer,
      title: primer.title,
      sub: primer.summary,
      tag: p.tags.primer,
      href: "/#belajar",
      primer: primer.id,
      keywords: "primer",
    })),
    ...academyClasses.map((c) => ({
      id: `c-${c.file}`,
      group: p.groups.class,
      title: c.title,
      sub: c.speaker,
      tag: p.tags.class,
      href: "/#kelas",
      keywords: `${p.tags.class} academy nifiberbagi`,
    })),

    // Business offerings
    ...services.map((s) => ({
      id: `s-${s.id}`,
      group: p.groups.business,
      title: s.title,
      sub: businessShort[lang][s.id],
      tag: p.tags.service,
      href: `/for-business#${s.id}`,
      keywords: "partnership",
    })),
  ];

  return {
    terms: getJargon(lang),
    entries,
    suggestions: entries.filter((e) => e.group === p.groups.nav || e.group === p.groups.action),
  };
}

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// Every word of the query must appear somewhere in the entry. Title matches
// rank first.
export function search(index, query) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return { terms: [], entries: [] };

  const hit = (text) => words.every((w) => text.includes(w));
  const terms = index.terms.filter((t) => hit(norm(`${t.term} ${t.meaning}`)));

  const scored = [];
  for (const e of index.entries) {
    const title = norm(e.title);
    const all = norm(`${e.title} ${e.sub} ${e.keywords || ""} ${e.tag || ""} ${e.group}`);
    if (!hit(all)) continue;
    scored.push({ e, score: title.startsWith(words[0]) ? 0 : hit(title) ? 1 : 2 });
  }
  scored.sort((a, b) => a.score - b.score);
  return { terms, entries: scored.map((s) => s.e).slice(0, 12) };
}
