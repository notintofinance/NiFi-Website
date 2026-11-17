import PageFrame from "@/components/home/PageFrame";
import Section from "@/components/home/Section";
import LearnPath from "@/components/home/LearnPath";
import LabTabs from "@/components/home/lab/LabTabs";
import AcademyClasses from "@/components/home/AcademyClasses";

const title = "Learn | Not Into Finance (NiFi)";
const description =
  "Five short primers for beginners, five small calculators in the Lab, and NiFi Academy online classes taught by practitioners.";

export const metadata = {
  title,
  description,
  openGraph: { title, description, url: "https://notintofinance.com/learn", type: "website" },
};

// Learn: the beginner primers, then the Lab (the same ideas with numbers you
// can change), then the NiFi Academy classes.
export default function Page() {
  return (
    <PageFrame>
      <Section id="belajar" page>
        <LearnPath />
      </Section>
      <Section id="lab">
        <LabTabs />
        <div className="mt-16 sm:mt-24">
          <AcademyClasses />
        </div>
      </Section>
    </PageFrame>
  );
}
