"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { siteConfig } from "@/data/site-config";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-700/60 bg-navy-900/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <Logo size={36} href="/" />

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.links.arthara}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-accent-bright"
          >
            Access Arthara
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-slate-200 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-navy-700/60 bg-navy-900 md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-navy-700 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={siteConfig.links.arthara}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-lg bg-accent px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Access Arthara
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
