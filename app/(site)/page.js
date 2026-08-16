import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBand from "@/components/StatsBand";
import About from "@/components/About";
import Pillars from "@/components/Pillars";
import ActionHub from "@/components/ActionHub";
import FeaturedHub from "@/components/FeaturedHub";
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
          <Pillars />
        </Reveal>
        <Reveal>
          <ActionHub />
        </Reveal>
        <Reveal>
          <FeaturedHub />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
