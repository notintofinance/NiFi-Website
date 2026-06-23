import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 text-center">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
        <div className="relative">
          <p className="text-7xl font-bold tracking-tight text-accent-bright sm:text-8xl">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            We couldn&apos;t find that page
          </h1>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            The page you&apos;re looking for might have moved, or never existed.
            Let&apos;s get you back on track.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-bright"
            >
              <Home size={16} />
              Back home
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800/60 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-accent hover:text-white"
            >
              <ArrowLeft size={16} />
              Browse research
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
