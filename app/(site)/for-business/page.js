import Image from "next/image";
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

// Approved logo assets. The five below come from NiFi's own partnership deck;
// Bitget Wallet and ICMSS UI were supplied as official brand assets.
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
        <Image
          src="/nifi-mark.png"
          alt=""
          width={1024}
          height={798}
          className="pointer-events-none absolute -right-28 -top-16 w-[30rem] max-w-none opacity-[0.04]"
        />

        <div className="relative mx-auto max-w-5xl">
          {/* Intro */}
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              For Business
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-brand sm:text-5xl">
              Partner with Not Into Finance
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              We help finance and fintech brands reach an engaged,
              finance-curious audience through promotional posts across our
              social media accounts and community.
            </p>
          </div>

          {/* Two boxes */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Service Details */}
            <section className="relative overflow-hidden rounded-3xl border border-line bg-white p-8 shadow-soft">
              <span className="absolute left-0 top-0 h-1 w-20 rounded-br-full bg-gold" />
              <h2 className="font-display text-xl font-semibold text-brand">
                Service Details
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                We run partner placements through the channels and formats we
                already publish on:
              </p>

              <ul className="mt-6 space-y-5">
                {placements.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand/5 text-brand">
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

            {/* Previous Partnerships */}
            <section className="relative overflow-hidden rounded-3xl border border-line bg-cream p-8 shadow-soft">
              <span className="absolute left-0 top-0 h-1 w-20 rounded-br-full bg-gold" />
              <h2 className="font-display text-xl font-semibold text-brand">
                Previous Partnerships
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                A selection of organizations we&apos;ve worked with.
                Collaboration types have varied across partners.
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
