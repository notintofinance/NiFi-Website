import Image from "next/image";
import { Mail, ArrowDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { siteConfig } from "@/data/site-config";

export const metadata = {
  title: "For Business | Not Into Finance (NiFi)",
  description:
    "Collaborate with Not Into Finance on learning programs, research and content, and community distribution.",
  openGraph: {
    title: "For Business | Not Into Finance (NiFi)",
    description:
      "Collaborate with Not Into Finance on learning programs, research and content, and community distribution.",
    url: "https://notintofinance.com/for-business",
    type: "website",
  },
};

// Grounded in what NiFi already does. Campaign formats are framed as
// possibilities agreed per collaboration, not as packaged deliverables.
const services = [
  {
    title: "Learning & Programs",
    body: "Academy class sessions and learning programs that explain finance and investing in plain language.",
  },
  {
    title: "Research & Content",
    body: "Equity and sector research and explainers produced by the NiFi team. Possible formats include research-led content around a topic you care about.",
  },
  {
    title: "Community & Distribution",
    body: "Reach our Discord community and social channels. Possible formats include promotional posts, carousels, newsletter mentions, and community announcements.",
  },
];

// White monochrome versions of the approved logos in public/partners. Five
// come from NiFi's partnership deck; Bitget Wallet and ICMSS UI were supplied
// by NiFi as official assets.
const partners = [
  { name: "Ajaib", file: "ajaib.png", w: 267, h: 84 },
  { name: "Bitget Wallet", file: "bitget.png", w: 688, h: 116 },
  { name: "Samuel Sekuritas", file: "samuel-sekuritas.png", w: 252, h: 100 },
  { name: "Syailendra Capital", file: "syailendra.png", w: 196, h: 20 },
  { name: "Doo Financials", file: "doo-financials.png", w: 250, h: 69 },
  { name: "finplan.id", file: "finplan.png", w: 316, h: 90 },
  { name: "ICMSS UI", file: "icmss-ui.png", w: 220, h: 218 },
];

export default function ForBusiness() {
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
    "Collaboration with Not Into Finance"
  )}`;

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <div className="max-w-3xl">
            <p className="eyebrow">For Business</p>
            <h1 className="mt-6 text-[3rem] leading-[1.03] sm:text-7xl">
              Open for <em className="text-cool">collaboration.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-400">
              We work with finance and fintech brands and institutions on
              learning programs, research and content, and reaching our
              community.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href={mailto} className="btn-primary">
                <Mail size={17} aria-hidden="true" />
                Discuss a Collaboration
              </a>
              <a href="#services" className="btn-secondary">
                Services &amp; partnerships
                <ArrowDown size={15} className="text-slate-500" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* ── Services & Previous Partnerships ─────────────── */}
        <section
          id="services"
          aria-labelledby="services-title"
          className="border-t border-white/[0.08]"
        >
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
            <h2 id="services-title" className="text-4xl leading-[1.08] sm:text-5xl">
              Services &amp; Previous Partnerships
            </h2>

            <div className="mt-14 grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
              {/* Services */}
              <Reveal>
                <div>
                  <p className="eyebrow">Services</p>
                  <ol className="mt-6 border-t border-white/[0.08]">
                    {services.map((s, i) => (
                      <li
                        key={s.title}
                        className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-white/[0.08] py-8"
                      >
                        <span className="pt-1.5 text-sm font-medium text-cool">
                          0{i + 1}
                        </span>
                        <div>
                          <h3 className="text-2xl sm:text-3xl">{s.title}</h3>
                          <p className="mt-3 text-base leading-relaxed text-slate-400">
                            {s.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-6 text-sm text-slate-400">
                    Scope and deliverables are agreed for each collaboration.
                  </p>
                </div>
              </Reveal>

              {/* Previous partnerships */}
              <Reveal>
                <div>
                  <p className="eyebrow">Previous Partnerships</p>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                    Organizations NiFi has collaborated with. The type of
                    collaboration has varied from partner to partner.
                  </p>
                  <ul className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.08]">
                    {partners.map((p, i) => (
                      <li
                        key={p.file}
                        className={`flex min-h-[8.5rem] flex-col items-center justify-center gap-3 border-white/[0.08] px-4 py-6 ${
                          i % 2 === 0 && i !== partners.length - 1 ? "border-r" : ""
                        } ${i < partners.length - 1 ? "border-b" : ""} ${
                          i === partners.length - 1 ? "col-span-2" : ""
                        }`}
                      >
                        <Image
                          src={`/partners/mono/${p.file}`}
                          alt=""
                          width={p.w}
                          height={p.h}
                          className="max-h-9 w-auto max-w-[75%] object-contain opacity-90"
                        />
                        <span className="text-xs text-slate-400">{p.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Closing CTA ──────────────────────────────────── */}
        <section
          aria-labelledby="contact-title"
          className="mx-auto max-w-6xl px-5 pb-24 sm:px-6"
        >
          <Reveal>
            <div className="rounded-[1.75rem] border border-white/10 bg-cool-deep px-6 py-16 text-center sm:px-12 sm:py-20">
              <h2
                id="contact-title"
                className="mx-auto max-w-2xl text-4xl leading-[1.08] sm:text-6xl"
              >
                Let&apos;s talk about working together.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base text-slate-300">
                Tell us about your brand and what you have in mind. We&apos;ll
                reply by email.
              </p>
              <div className="mt-9 flex flex-col items-center gap-4">
                <a href={mailto} className="btn-primary">
                  <Mail size={17} aria-hidden="true" />
                  Discuss a Collaboration
                </a>
                <a
                  href={mailto}
                  className="text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
                >
                  {siteConfig.contactEmail}
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
