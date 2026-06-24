import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBand from "@/components/StatsBand";
import About from "@/components/About";
import Services from "@/components/Services";
import ActionHub from "@/components/ActionHub";
import CommunityProgram from "@/components/CommunityProgram";
import FeaturedResearch from "@/components/FeaturedResearch";
import FeaturedArticles from "@/components/FeaturedArticles";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBand />
        <Reveal>
          <About />
        </Reveal>
        <Reveal>
          <Services />
        </Reveal>
        <Reveal>
          <ActionHub />
        </Reveal>
        <Reveal>
          <CommunityProgram />
        </Reveal>
        <Reveal>
          <FeaturedResearch />
        </Reveal>
        <Reveal>
          <FeaturedArticles />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
