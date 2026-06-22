import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://notintofinance.id"),
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
    type: "website",
    images: ["/logo-nifi.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
