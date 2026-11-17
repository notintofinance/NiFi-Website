import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Hero from "@/components/home/Hero";
import PartnerMarquee from "@/components/home/PartnerMarquee";
import Section from "@/components/home/Section";
import PathShowcase from "@/components/home/PathShowcase";
import CoalFeature from "@/components/home/CoalFeature";
import ContentBrowser from "@/components/home/ContentBrowser";
import CommunitySection from "@/components/home/CommunitySection";
import BusinessBlock from "@/components/home/BusinessBlock";
import { researchReports } from "@/data/research-data";
import { content } from "@/data/content";
import { topics } from "@/data/home-data";

const covers = researchReports.slice(0, 3).map((r) => ({ src: r.cover, title: r.title }));

// Home: hero, previous partners, three ways to start, research (led by the
// latest report, The Coal Paradox), community and the For Business block.
// The beginner primers, the Lab and the classes live on /learn.
// Section headings and all interface text are in data/copy.js (two
// languages); the sections read them through useLang().
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative">
        {/* Page guide lines (wide screens only) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[76rem] -translate-x-1/2 border-x border-white/[0.05] xl:block"
        />

        <Hero />
        <PartnerMarquee />

        <div className="mt-16 sm:mt-24">
          <Section id="mulai">
            <PathShowcase covers={covers} />
          </Section>

          <Section id="research">
            <CoalFeature />
            <div className="mt-10 sm:mt-14">
              <ContentBrowser items={content} topics={topics} />
            </div>
          </Section>

          <Section id="komunitas">
            <CommunitySection />
          </Section>

          <section aria-labelledby="bisnis-title" className="relative border-t border-white/[0.07]">
            <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
              <Reveal>
                <BusinessBlock />
              </Reveal>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
