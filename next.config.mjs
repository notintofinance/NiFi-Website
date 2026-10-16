/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Market Today and Market Sentiment were merged into one page at /sentiment.
  async redirects() {
    return [{ source: "/market-today", destination: "/sentiment", permanent: true }];
  },
};

export default nextConfig;
