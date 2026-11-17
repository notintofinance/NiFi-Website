import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Hero from "@/components/home/Hero";
import PartnerMarquee from "@/components/home/PartnerMarquee";
import Section from "@/components/home/Section";
import PathShowcase from "@/components/home/PathShowcase";
import LabTabs from "@/components/home/lab/LabTabs";
import ContentBrowser from "@/components/home/ContentBrowser";
import LearnPath from "@/components/home/LearnPath";
import AcademyClasses from "@/components/home/AcademyClasses";
import CommunitySection from "@/components/home/CommunitySection";
import BusinessBlock from "@/components/home/BusinessBlock";
import { researchReports } from "@/data/research-data";
import { articles } from "@/data/article-data";
import { contentMeta, topics } from "@/data/home-data";

// Real research reports (PDF) and articles (on X), newest first. Titles stay
// as published; the one-line summaries exist in both languages.
const meta = (id, fallback) => ({
  topics: contentMeta[id]?.topics ?? ["other"],
  summary: { id: contentMeta[id]?.id ?? fallback, en: contentMeta[id]?.en ?? fallback },
});
const content = [
  ...researchReports.map((r) => ({
    id: r.id,
    type: "research",
    title: r.title,
    date: r.date,
    href: r.file,
    cover: r.cover,
    ...meta(r.id, r.summary),
  })),
  ...articles.map((a) => ({
    id: a.id,
    type: "article",
    title: a.title,
    date: a.date,
    href: a.url,
    ...meta(a.id, a.summary),
  })),
].sort((a, b) => b.date.localeCompare(a.date));

const covers = researchReports.slice(0, 3).map((r) => ({ src: r.cover, title: r.title }));

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

          <Section id="lab">
            <LabTabs />
          </Section>

          <Section id="research">
            <ContentBrowser items={content} topics={topics} />
          </Section>

          <Section id="belajar">
            <LearnPath />
            <div className="mt-14 sm:mt-20">
              <AcademyClasses />
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
