import Image from "next/image";
import { Users, Compass, Mail, ArrowRight, ArrowUpRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { siteConfig } from "@/data/site-config";

// Secondary action row (Arthara, Newsletter).
function SecondaryAction({ icon: Icon, label, description, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-1 items-center gap-4 rounded-2xl border border-navy-600/60 bg-navy-700/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-navy-700/70"
    >
      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-bright transition-colors group-hover:bg-accent group-hover:text-white">
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-white">{label}</h3>
        <p className="mt-0.5 text-sm leading-relaxed text-slate-400">
          {description}
        </p>
      </div>
      <ArrowUpRight
        size={20}
        className="shrink-0 text-slate-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-bright"
      />
    </a>
  );
}

export default function ActionHub() {
  return (
    <section id="action-hub" className="border-y border-navy-700/50 bg-navy-800/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          eyebrow="Get Started"
          title="A few ways to get involved"
          subtitle="However you'd like to start, you're welcome here."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-5">
          {/* Featured — Community */}
          <a
            href={siteConfig.links.community}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/20 via-navy-700/60 to-navy-800/70 p-8 transition-colors hover:border-accent/60 lg:col-span-3"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 opacity-[0.07]">
              <Image
                src="/logo-nifi.png"
                alt=""
                width={220}
                height={220}
                aria-hidden="true"
              />
            </div>

            <div className="relative">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-glow">
                <Users size={28} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                Join Our Community
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-slate-300">
                Spend time with people learning the same things you are. Ask
                anything, share what you know, and figure finance out together.
                No question is too basic.
              </p>
            </div>

            <span className="relative mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-accent-bright">
              Join the Discord
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </a>

          {/* Secondary stack */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <SecondaryAction
              icon={Compass}
              label="Access Arthara"
              description="Explore Arthara, our platform for going deeper into research and the markets."
              href={siteConfig.links.arthara}
            />
            <SecondaryAction
              icon={Mail}
              label="Subscribe to Our Free Newsletter"
              description="Our latest research and plain, simple takes, straight to your inbox."
              href={siteConfig.links.newsletter}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
