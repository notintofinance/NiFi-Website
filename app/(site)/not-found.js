import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-5 py-24 sm:px-6">
        <p className="eyebrow">404</p>
        <h1 className="mt-6 max-w-2xl text-5xl leading-[1.05] sm:text-7xl">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-6 max-w-md text-lg text-slate-400">
          It may have moved, or never existed.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">
            Back home
          </Link>
          <Link href="/for-business" className="btn-secondary">
            For Business
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
