import fs from "node:fs";
import path from "node:path";
import { learnTopics } from "@/data/learn-data";
import { getAllAnalysts } from "@/lib/content";
import { TAGS } from "@/data/tags-data";

export default function sitemap() {
  const base = "https://notintofinance.com";

  const staticRoutes = [
    "",
    "/hub",
    "/research",
    "/article",
    "/newsletter",
    "/carousel",
    "/learn",
    "/community",
    "/analyst",
    "/contact",
  ];

  const learnRoutes = learnTopics.map((t) => `/learn/${t.id}`);
  const analystRoutes = getAllAnalysts().map((a) => `/analyst/${a.slug}`);
  const tagRoutes = Object.values(TAGS).map((t) => `/tag/${t.slug}`);

  const productRoutes = fs.existsSync(path.join(process.cwd(), "public", "market-today", "index.html"))
    ? ["/market-today"]
    : [];

  const routes = [...staticRoutes, ...productRoutes, ...learnRoutes, ...analystRoutes, ...tagRoutes];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
