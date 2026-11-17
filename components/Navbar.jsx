"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import Logo from "./Logo";
import { siteConfig } from "@/data/site-config";
import { LangSwitch, useLang } from "./Lang";

// The search palette (and its index) loads the first time it is opened.
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

function JoinButton({ className = "", onClick }) {
  const { t } = useLang();
  return (
    <a
      href={siteConfig.links.community}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-slate-200 ${className}`}
    >
      <Image src="/discord-logo.png" alt="" width={20} height={20} className="h-4 w-4 rounded-[4px]" />
      <span>
        {t.nav.join}
        <span className="sr-only sm:not-sr-only">{t.nav.joinRest}</span>
      </span>
    </a>
  );
}

// Desktop shows the four links inline. On small screens they move into a
// menu (opened with a labelled button, closed with Escape or by choosing a
// link); the Join button stays visible in the bar at every size.
//
// Also here: the search palette (⌘K, Ctrl+K, "/" or the Cari button), the
// highlight of the Home section currently on screen, and a thin reading
// progress line under the bar.
export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState({ open: false, query: "", loaded: false });
  const [section, setSection] = useState(null);
  const progress = useRef(null);

  // Open the palette from the keyboard or from elsewhere on the page
  // (window event "nifi:search", optional detail = starting query).
  useEffect(() => {
    const show = (query = "") => setPalette({ open: true, query, loaded: true });
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => ({ open: !p.open, query: "", loaded: true }));
      } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        show();
      }
    };
    const onEvent = (e) => show(typeof e.detail === "string" ? e.detail : "");
    window.addEventListener("keydown", onKey);
    window.addEventListener("nifi:search", onEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nifi:search", onEvent);
    };
  }, []);

  // Which Home section is in the middle of the screen.
  useEffect(() => {
    if (pathname !== "/") {
      setSection(null);
      return;
    }
    const ids = siteConfig.nav.map((n) => n.href.split("#")[1]).filter(Boolean);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (items) => {
        for (const it of items) {
          if (it.isIntersecting) setSection(it.target.id);
          else setSection((s) => (s === it.target.id ? null : s));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // Reading progress line.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const v = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${v})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isCurrent = (href) => !href.includes("#") && pathname.startsWith(href);
  const isOnScreen = (href) => pathname === "/" && section != null && href.endsWith(`#${section}`);
  const openSearch = () => setPalette({ open: true, query: "", loaded: true });

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-ink-950/85 backdrop-blur-md">
      <nav
        aria-label={t.nav.main}
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6"
      >
        <Logo size={30} href="/" />

        <div className="hidden items-center gap-5 md:flex">
          {siteConfig.nav.map((item) => {
            const on = isCurrent(item.href) || isOnScreen(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : isOnScreen(item.href) ? "location" : undefined}
                className={`relative inline-flex min-h-[44px] items-center text-sm font-medium transition-colors hover:text-white ${
                  on ? "text-white" : "text-slate-400"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-1.5 h-px origin-left bg-cool transition-transform duration-300 ${
                    on ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
          <button
            type="button"
            onClick={openSearch}
            aria-haspopup="dialog"
            aria-keyshortcuts="Meta+K Control+K"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/15 pl-3 pr-2 text-sm text-slate-400 transition-colors hover:border-white/40 hover:text-white"
          >
            <Search size={15} aria-hidden="true" />
            {t.nav.search}
            <kbd className="kbd ml-1" aria-hidden="true">
              ⌘K
            </kbd>
          </button>
          <LangSwitch />
          <JoinButton />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <JoinButton />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>
      <span
        ref={progress}
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px block h-px origin-left bg-gradient-to-r from-play-blue via-play-violet to-play-cyan"
        style={{ transform: "scaleX(0)" }}
      />

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-white/[0.08] bg-ink-950 md:hidden"
      >
        <ul className="mx-auto max-w-6xl px-5 py-3">
          <li className="border-b border-white/[0.06]">
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => {
                setOpen(false);
                openSearch();
              }}
              className="flex min-h-[52px] w-full items-center gap-3 text-left font-display text-lg font-bold tracking-tight text-white"
            >
              <Search size={18} className="text-slate-400" aria-hidden="true" />
              {t.nav.searchLong}
            </button>
          </li>
          {siteConfig.nav.map((item) => (
            <li key={item.href} className="border-b border-white/[0.06] last:border-b-0">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className="flex min-h-[52px] items-center font-display text-lg font-bold tracking-tight text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="flex min-h-[64px] items-center justify-between gap-4">
            <span className="micro">{t.nav.language}</span>
            <LangSwitch large />
          </li>
        </ul>
      </div>

      {palette.loaded && (
        <CommandPalette
          open={palette.open}
          initialQuery={palette.query}
          onClose={() => setPalette((p) => ({ ...p, open: false }))}
        />
      )}
    </header>
  );
}
