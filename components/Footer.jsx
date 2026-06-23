import Link from "next/link";
import Logo from "./Logo";
import { siteConfig } from "@/data/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-navy-700/60 bg-navy-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="max-w-sm">
            <Logo size={36} href="/" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Research, education, and community for people who aren&apos;t into
              finance yet. We&apos;d love for you to learn it with us.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-navy-800 pt-6 text-center text-xs text-slate-500">
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
