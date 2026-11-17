import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { siteConfig } from "@/data/site-config";
import { MotionProvider } from "@/components/Motion";
import { LangProvider } from "@/components/Lang";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Plus Jakarta Sans for headlines (designed in Jakarta); Inter carries the UI
// and body text. Self-hosted from @fontsource-variable: Google Fonts serves
// this family from extension-less URLs, which next/font/google in Next 14.2
// cannot parse (the Vercel build fails).
const jakarta = localFont({
  src: "../../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2",
  weight: "200 800",
  style: "normal",
  variable: "--font-display",
  display: "swap",
});

export const viewport = {
  themeColor: "#08090B",
};

export const metadata = {
  metadataBase: new URL("https://notintofinance.com"),
  title: "Not Into Finance (NiFi) | Finance for people not into finance",
  description:
    "Not Into Finance (NiFi) is a research, education, and community space that explains money and markets in plain language, for people who aren't into finance yet.",
  keywords: [
    "financial literacy",
    "financial education",
    "investing community",
    "financial research",
    "NiFi",
    "Not Into Finance",
  ],
  openGraph: {
    title: "Not Into Finance (NiFi)",
    description:
      "Research, education, and community, making finance understandable for people who aren't into finance.",
    url: "https://notintofinance.com",
    siteName: "Not Into Finance",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Not Into Finance (NiFi)",
    description:
      "Research, education, and community, making finance understandable for people who aren't into finance.",
  },
};

// Organization structured data for search engines.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Not Into Finance",
  alternateName: "NiFi",
  url: "https://notintofinance.com",
  logo: "https://notintofinance.com/logo-nifi.png",
  description:
    "A research, education, and community space that explains finance in plain language.",
  sameAs: Object.values(siteConfig.socials).filter(Boolean),
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <LangProvider>
          <MotionProvider>{children}</MotionProvider>
        </LangProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
