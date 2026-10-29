import Image from "next/image";
import { Mail, GraduationCap, FileText, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/data/site-config";

export const metadata = {
  title: "For Business | Not Into Finance (NiFi)",
  description:
    "Collaborate with Not Into Finance across education, research, and community. See our capabilities and start a conversation.",
  openGraph: {
    title: "For Business | Not Into Finance (NiFi)",
    description:
      "Collaborate with Not Into Finance across education, research, and community.",
    url: "https://notintofinance.com/for-business",
    type: "website",
  },
};

// Capability groups grounded in what NiFi actually does (Academy/learning,
// research & content, and its community/channels). Specific campaign formats
// are framed as "possible collaboration formats", not packaged products.
const capabilities = [
  {
    icon: GraduationCap,
    title: "Learning & Programs",
    body: "Academy classes, workshops, and sessions that explain finance and investing in plain language.",
  },
  {
    icon: FileText,
    title: "Research & Content",
    body: "Equity and market research, carousels, and explainers made to be understood by everyday readers.",
  },
  {
    icon: Users,
    title: "Community & Distribution",
    body: "Reach our Discord community and social channels. Possible collaboration formats include social posts, carousels, newsletter mentions, and community announcements.",
  },
];

// Approved logo assets in public/partners. The first five come from NiFi's own
// partnership deck; Bitget Wallet and ICMSS UI were supplied as official assets.
const partners = [
  { name: "Ajaib", file: "ajaib.png", w: 342, h: 228 },
  { name: "Bitget Wallet", file: "bitget.png", w: 712, h: 186 },
  { name: "Samuel Sekuritas Indonesia", file: "samuel-sekuritas.png", w: 252, h: 100 },
  { name: "Syailendra Capital", file: "syailendra.png", w: 196, h: 20 },
  { name: "Doo Financials", file: "doo-financials.png", w: 250, h: 69 },
  { name: "Finplan.id", file: "finplan.png", w: 316, h: 90 },
  { name: "ICMSS UI", file: "icmss-ui.png", w: 220, h: 218 },
];

export default function ForBusiness() {
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
    "Collaboration with Not Into Finance"
  )}`;

  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden bg-white px-6 pb-20 pt-16 sm:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-cream to-transparent" />
        <div className="pointer-events-none absolute -right-40 -top-28 h-[32rem] w-[32rem] rounded-full bg-cool-soft blur-[120px] opacity-60" />

        <div className="relative mx-auto max-w-5xl">
          {/* Intro */}
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-cool" />
              For Business
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-brand sm:text-5xl">
              Let&apos;s build something together
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Not Into Finance is open to collaborating with brands and
              organizations in finance and fintech — from education and research
              to reaching our community.
            </p>
          </div>

          {/* Two columns */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Service details / capabilities */}
            <section className="relative overflow-hidden rounded-3xl border border-line bg-white p-8 shadow-soft">
              <span className="absolute left-0 top-0 h-1 w-20 rounded-br-full bg-cool" />
              <h2 className="font-display text-xl font-semibold text-brand">
                What we can do together
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                A few areas where we collaborate. We&apos;ll scope the right
                format with you rather than sell a fixed package.
              </p>

              <ul className="mt-6 space-y-5">
                {capabilities.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-cool-soft text-cool">
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand">{title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <a
                href={mailto}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-hover"
              >
                <Mail size={16} />
                Discuss a Collaboration
              </a>
            </section>

            {/* Selected collaborations */}
            <section className="relative overflow-hidden rounded-3xl border border-line bg-cream p-8 shadow-soft">
              <span className="absolute left-0 top-0 h-1 w-20 rounded-br-full bg-cool" />
              <h2 className="font-display text-xl font-semibold text-brand">
                Selected Collaborations
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Organizations we&apos;ve worked with. The type of collaboration
                has varied across partners.
              </p>

              <ul className="mt-6 grid grid-cols-2 gap-3">
                {partners.map((p) => (
                  <li
                    key={p.file}
                    className="group flex h-[76px] items-center justify-center rounded-2xl border border-line bg-white p-4"
                  >
                    <Image
                      src={`/partners/${p.file}`}
                      alt={p.name}
                      title={p.name}
                      width={p.w}
                      height={p.h}
                      className="max-h-9 w-auto max-w-full object-contain transition duration-300 group-hover:scale-105"
                    />
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
