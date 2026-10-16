/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The full Market Today dashboard runs live on Fly.io. Both entry points
  // send visitors to the live app. (Temporary redirects so we can later swap
  // in a markets.notintofinance.com subdomain without cache headaches.)
  async redirects() {
    const dashboard = "https://nifi-market-today.fly.dev/markets";
    return [
      { source: "/market-today", destination: dashboard, permanent: false },
      { source: "/sentiment", destination: dashboard, permanent: false },
    ];
  },
};

export default nextConfig;
