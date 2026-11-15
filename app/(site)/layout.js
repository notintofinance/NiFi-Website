import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { siteConfig } from "@/data/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Plus Jakarta Sans for headlines (designed in Jakarta); Inter carries the UI
// and body text.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
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
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
