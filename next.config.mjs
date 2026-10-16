/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The full Market Today dashboard is published as a self-contained page in
  // public/market-today/index.html and served at the clean URL /market-today.
  async rewrites() {
    return [{ source: "/market-today", destination: "/market-today/index.html" }];
  },
  // The earlier /sentiment page was folded into the full Market Today page.
  async redirects() {
    return [{ source: "/sentiment", destination: "/market-today", permanent: true }];
  },
};

export default nextConfig;
