import Image from "next/image";
import { Mail, GraduationCap, FileText, Users, ArrowDown } from "lucide-react";
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

// Capability groups grounded in what NiFi actually does. Specific campaign
// formats are framed as "possible collaboration formats", not packaged products.
const capabilities = [
  {
    icon: GraduationCap,
    title: "Learning & Programs",
    body: "Academy classes, workshops, and sessions that explain finance and investing in plain language.",
  },
  {
    icon: FileText,
    title: "Research & Content",
    body: "Equity and market research, carousels, and explainers written for everyday readers.",
  },
  {
    icon: Users,
    title: "Community & Distribution",
    body: "Reach our Discord community and social channels. Possible formats include social posts, carousels, newsletter mentions, and community announcements.",
  },
];

// Real NiFi research covers, shown as proof of the research we publish.
const research = [
  { title: "The Greatest of Indonesiawit", file: "indonesiawit-palm-oil.jpg" },
  { title: "The New Alternative Energy", file: "new-alternative-energy.jpg" },
  { title: "LPCK: Lippo Cikarang", file: "lpck-lippo-cikarang.jpg" },
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
      <main className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-cream to-transparent" />
        <div className="pointer-events-none absolute -right-40 -top-28 h-[32rem] w-[32rem] rounded-full bg-cool-soft opacity-70 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-6">
          {/* Hero */}
          <section className="pb-14 pt-16 sm:pt-24 lg:pb-16">
            <div className="max-w-3xl">
              <span className="eyebrow-pill">
                <span className="h-1.5 w-1.5 rounded-full bg-cool" />
                For Business
              </span>
              <h1 className="mt-7 font-display text-[2.6rem] font-bold leading-[1.04] tracking-[-0.03em] text-brand sm:text-6xl">
                Partner with a community that{" "}
                <span className="text-cool">explains finance clearly.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-600">
                Not Into Finance is open to collaboration with finance and
                fintech brands, from education and research to reaching our
                community.
              </p>

              <div className="mt-10 flex flex-col gap-3.5 sm:flex-row">
                <a
                  href={mailto}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-hover"
                >
                  <Mail size={16} />
                  Discuss a Collaboration
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-line bg-white px-7 py-3.5 text-sm font-semibold text-brand transition-colors hover:border-brand"
                >
                  See what we offer
                  <ArrowDown size={15} className="text-slate-400" />
                </a>
              </div>
            </div>
          </section>

          {/* Two boxes */}
          <section
            id="services"
            className="scroll-mt-24 grid gap-6 pb-24 md:grid-cols-2"
          >
            {/* What we can do together */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-white p-8 shadow-soft transition-shadow hover:shadow-lift sm:p-9">
              <span className="absolute left-0 top-0 h-1 w-20 rounded-br-full bg-cool" />
              <h2 className="font-display text-xl font-semibold text-brand">
                What we can do together
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                A few areas where we collaborate. We&apos;ll scope the right
                format with you rather than sell a fixed package.
              </p>

              <ul className="mt-7 space-y-5">
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

              <div className="mt-8 border-t border-line pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Research we publish
                </p>
                <ul className="mt-4 grid grid-cols-3 gap-3">
                  {research.map((r) => (
                    <li key={r.file} className="group">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-line bg-cream">
                        <Image
                          src={`/research/covers/${r.file}`}
                          alt={`Cover of ${r.title}`}
                          fill
                          sizes="(max-width: 768px) 30vw, 14rem"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-snug text-slate-500">
                        {r.title}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={mailto}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-hover"
              >
                <Mail size={16} />
                Discuss a Collaboration
              </a>
            </div>

            {/* Selected collaborations */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-cream p-8 shadow-soft transition-shadow hover:shadow-lift sm:p-9">
              <span className="absolute left-0 top-0 h-1 w-20 rounded-br-full bg-cool" />
              <h2 className="font-display text-xl font-semibold text-brand">
                Selected Collaborations
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Organizations we&apos;ve worked with. The type of collaboration
                has varied across partners.
              </p>

              <ul className="mt-7 grid grid-cols-2 gap-3">
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
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
