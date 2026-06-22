import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import ActionHub from "@/components/ActionHub";
import ResearchLibrary from "@/components/ResearchLibrary";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <ActionHub />
        <ResearchLibrary />
      </main>
      <Footer />
    </>
  );
}
