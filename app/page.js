import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import ActionHub from "@/components/ActionHub";
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
