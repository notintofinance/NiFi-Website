/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The site is now two pages (Home + For Business). These keep links to the
  // old content-hub routes working by sending visitors to the closest match.
  // Temporary redirects, so destinations can change later without cache issues.
  // Static files under /public (e.g. /research/*.pdf) are not affected.
  async redirects() {
    const dashboard = "https://markets.notintofinance.com/markets";
    const t = (source, destination) => ({ source, destination, permanent: false });
    return [
      t("/market-today", dashboard),
      t("/sentiment", dashboard),
      t("/research", "/#research"),
      t("/learn", "/#education"),
      t("/learn/:slug", "/#education"),
      t("/community", "/#community"),
      t("/contact", "/for-business"),
      t("/newsletter", "https://notintofinance.beehiiv.com"),
      t("/hub", "/"),
      t("/article", "/"),
      t("/carousel", "/"),
      t("/analyst", "/"),
      t("/analyst/:slug", "/"),
      t("/tag/:slug", "/"),
    ];
  },
};

export default nextConfig;
