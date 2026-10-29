import Link from "next/link";
import Logo from "./Logo";
import SocialLinks from "./SocialLinks";
import { siteConfig } from "@/data/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-ink-950">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
          <div className="max-w-xs">
            <Logo size={32} href="/" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Finance in plain language, for people who aren&apos;t into finance
              yet.
            </p>
          </div>

          <div className="flex flex-col gap-6 md:items-end">
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-white"
              >
                Home
              </Link>
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition-colors hover:text-white"
              >
                {siteConfig.contactEmail}
              </a>
            </nav>
            <SocialLinks />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/[0.08] pt-6 text-xs text-slate-400 sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name} ({siteConfig.shortName}).
            All rights reserved.
          </p>
          <p>For educational purposes only. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
