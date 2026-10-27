import { Mail, Megaphone, Images, Newspaper, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site-config";

export const metadata = {
  title: "For Business | Not Into Finance (NiFi)",
  description:
    "Promotional placements with Not Into Finance across our social media channels and community. See how we can collaborate.",
  openGraph: {
    title: "For Business | Not Into Finance (NiFi)",
    description:
      "Promotional placements with Not Into Finance across our social media channels and community.",
    url: "https://notintofinance.com/for-business",
    type: "website",
  },
};

// Channels and formats are limited to what Not Into Finance already runs:
// its social accounts, carousel explainers, the newsletter, and the community.
const placements = [
  {
    icon: Megaphone,
    title: "Social media posts",
    body: "Featured posts across our Instagram, X, and LinkedIn accounts.",
  },
  {
    icon: Images,
    title: "Carousel explainers",
    body: "Multi-slide carousels that introduce a product or idea in plain language.",
  },
  {
    icon: Newspaper,
    title: "Newsletter mentions",
    body: "Placements within our email newsletter.",
  },
  {
    icon: Users,
    title: "Community announcements",
    body: "Shared with our Discord community.",
  },
];

// Organizations we have collaborated with. Text only — collaboration types
// have varied, so these are not presented as identical engagements.
const partners = [
  "Ajaib",
  "Bitget",
  "Samuel Sekuritas",
  "Syailendra Capital",
  "Doo Financials",
  "Finplan.id",
  "ICMSS UI",
];

export default function ForBusiness() {
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
    "Collaboration with Not Into Finance"
  )}`;

  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden px-6 py-16 sm:py-24">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />

        <div className="relative mx-auto max-w-5xl">
          {/* Intro */}
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              For Business
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              Not Into Finance works with finance and fintech brands through
              promotional placements across our social media channels and
              community. If you&apos;d like to reach our audience, here&apos;s
              how we can collaborate.
            </p>
          </div>

          {/* Two boxes */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Service Details */}
            <section className="rounded-2xl border border-navy-600 bg-navy-800/50 p-7 shadow-card">
              <h2 className="font-display text-xl font-semibold text-white">
                Service Details
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                We share partner placements through the channels and formats we
                already run:
              </p>

              <ul className="mt-6 space-y-5">
                {placements.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-3.5">
                    <span className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-accent/15 text-accent-bright">
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-400">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <a
                href={mailto}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-bright"
              >
                <Mail size={16} />
                Discuss a Collaboration
              </a>
            </section>

            {/* Previous Partnerships */}
            <section className="rounded-2xl border border-navy-600 bg-navy-800/50 p-7 shadow-card">
              <h2 className="font-display text-xl font-semibold text-white">
                Previous Partnerships
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Organizations we&apos;ve collaborated with. Collaboration types
                have varied across partners.
              </p>

              <ul className="mt-6 flex flex-wrap gap-2.5">
                {partners.map((name) => (
                  <li
                    key={name}
                    className="rounded-lg border border-navy-600 bg-navy-900/60 px-4 py-2.5 text-sm font-medium text-slate-200"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
