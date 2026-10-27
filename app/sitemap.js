export default function sitemap() {
  const base = "https://notintofinance.com";

  const routes = ["", "/for-business"];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
