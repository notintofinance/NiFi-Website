"use client";

import Link from "next/link";
import Logo from "./Logo";
import SocialLinks from "./SocialLinks";
import { siteConfig } from "@/data/site-config";
import { LangSwitch, useLang } from "./Lang";

const linkClass =
  "inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-white";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-white/[0.08] bg-ink-950">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
          <div className="max-w-xs">
            <Logo size={32} href="/" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {t.footer.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-6 md:items-end">
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1">
              {siteConfig.nav.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ))}
              <a
                href={siteConfig.links.arthara}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Arthara
              </a>
              <a href={`mailto:${siteConfig.contactEmail}`} className={linkClass}>
                {siteConfig.contactEmail}
              </a>
            </nav>
            <div className="flex flex-wrap items-center gap-4">
              <SocialLinks />
              <LangSwitch />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/[0.08] pt-6 text-xs text-slate-400 sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name} ({siteConfig.shortName}).
          </p>
          <p>{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
