import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-white px-6 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cream to-transparent" />
        <div className="relative">
          <p className="font-display text-7xl font-bold tracking-tight text-brand sm:text-8xl">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold text-brand sm:text-3xl">
            We couldn&apos;t find that page
          </h1>
          <p className="mx-auto mt-3 max-w-md text-slate-600">
            The page you&apos;re looking for might have moved, or never existed.
            Let&apos;s get you back on track.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              <Home size={16} />
              Back home
            </Link>
            <Link
              href="/for-business"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold text-brand transition-colors hover:border-brand"
            >
              <ArrowLeft size={16} />
              For Business
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
