import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ForBusinessContent from "@/components/business/ForBusinessContent";

export const metadata = {
  title: "For Business | Not Into Finance (NiFi)",
  description:
    "Brand placement, event and community activation, NiFi Academy and Arthara: ways for brands and organisations to work with Not Into Finance.",
  openGraph: {
    title: "For Business | Not Into Finance (NiFi)",
    description:
      "Brand placement, event and community activation, NiFi Academy and Arthara: ways to work with Not Into Finance.",
    url: "https://notintofinance.com/for-business",
    type: "website",
  },
};

// The page body (two languages) is in components/business/ForBusinessContent.jsx.
export default function ForBusiness() {
  return (
    <>
      <Navbar />
      <ForBusinessContent />
      <Footer />
    </>
  );
}
