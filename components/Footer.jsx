import Link from "next/link";
import Logo from "./Logo";
import SocialLinks from "./SocialLinks";
import { siteConfig } from "@/data/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="max-w-sm">
            <Logo size={34} href="/" />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Finance in plain language, for people who aren&apos;t into finance
              yet. Learn it with us.
            </p>
            <div className="mt-5">
              <SocialLinks />
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-center text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name} ({siteConfig.shortName}).
            All rights reserved.
          </p>
          <p className="mt-2">
            For educational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
