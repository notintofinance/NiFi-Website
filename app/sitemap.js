export default function sitemap() {
  const base = "https://notintofinance.com";
  const routes = ["", "/research", "/article", "/contact"];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
