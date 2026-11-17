import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Frame for the Learn page: navbar, the page guide lines, the content,
// footer.
export default function PageFrame({ children }) {
  return (
    <>
      <Navbar />
      <main className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[76rem] -translate-x-1/2 border-x border-white/[0.05] xl:block"
        />
        {children}
      </main>
      <Footer />
    </>
  );
}
