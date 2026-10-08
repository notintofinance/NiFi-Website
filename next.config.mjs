/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Market Today: one self-contained page, published from the Mac into public/market-today/index.html.
  async rewrites() {
    return [{ source: "/market-today", destination: "/market-today/index.html" }];
  },
};

export default nextConfig;
