"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { siteConfig } from "@/data/site-config";

function DiscordJoin({ className = "", onClick }) {
  return (
    <a
      href={siteConfig.links.community}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover ${className}`}
    >
      <Image src="/discord-logo.png" alt="" width={20} height={20} className="h-4 w-4 rounded-[4px]" />
      Join the Community
    </a>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Brand */}
        <Logo size={34} href="/" />

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`text-sm font-medium transition-colors hover:text-brand ${
                isActive(item.href) ? "text-brand" : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <DiscordJoin />
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-brand md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-white md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-cream hover:text-brand ${
                  isActive(item.href) ? "text-brand" : "text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <DiscordJoin className="mt-2 w-full" onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
