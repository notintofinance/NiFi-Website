import { Mail, MessagesSquare, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { siteConfig } from "@/data/site-config";

export const metadata = {
  title: "Contact | Not Into Finance (NiFi)",
  description:
    "Get in touch with Not Into Finance — questions, partnerships, or just to say hello.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Page header */}
        <section className="relative overflow-hidden border-b border-navy-700/50 bg-navy-800/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <span className="eyebrow">Contact Us</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Get in touch
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Questions, ideas, partnerships, or just want to say hello? Fill in
              the form and your message lands straight in our inbox.
            </p>
          </div>
        </section>

        {/* Form + side info */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-navy-600/60 bg-navy-700/40 p-6">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
                  <Mail size={22} />
                </div>
                <h3 className="font-semibold text-white">Email us</h3>
                <a
                  href="mailto:notintofinance.id@gmail.com"
                  className="mt-1 block break-all text-sm text-accent-bright hover:text-white"
                >
                  notintofinance.id@gmail.com
                </a>
              </div>

              <div className="rounded-2xl border border-navy-600/60 bg-navy-700/40 p-6">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
                  <Users size={22} />
                </div>
                <h3 className="font-semibold text-white">Join the community</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Prefer to chat? Hop into our Discord.
                </p>
                <a
                  href={siteConfig.links.community}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-accent-bright hover:text-white"
                >
                  Open Discord →
                </a>
              </div>

              <div className="rounded-2xl border border-navy-600/60 bg-navy-700/40 p-6">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
                  <MessagesSquare size={22} />
                </div>
                <h3 className="font-semibold text-white">Response time</h3>
                <p className="mt-1 text-sm text-slate-400">
                  We usually reply within a couple of days.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
