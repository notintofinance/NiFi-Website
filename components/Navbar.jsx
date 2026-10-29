"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { siteConfig } from "@/data/site-config";

// The nav is one link and one button, so it stays visible on every screen
// size instead of hiding behind a menu. On phones the wordmark collapses to
// the mark and the button label shortens; the accessible name stays full.
export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-ink-950/85 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6"
      >
        <div className="[&>a>span]:hidden sm:[&>a>span]:flex">
          <Logo size={30} href="/" />
        </div>

        <div className="flex items-center gap-2 sm:gap-5">
          {siteConfig.nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-[44px] items-center px-2 text-sm font-medium transition-colors hover:text-white ${
                  active ? "text-white" : "text-slate-400"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <a
            href={siteConfig.links.community}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-slate-200"
          >
            <Image
              src="/discord-logo.png"
              alt=""
              width={20}
              height={20}
              className="h-4 w-4 rounded-[4px]"
            />
            <span>
              Join<span className="sr-only sm:not-sr-only"> the Community</span>
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}
