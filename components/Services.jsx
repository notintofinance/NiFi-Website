import { FileSearch, GraduationCap, Users } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ServiceCard from "./ServiceCard";

// Our three core pillars. Edit copy or add a pillar here.
const pillars = [
  {
    icon: FileSearch,
    title: "Research",
    description:
      "Honest, readable research on companies and markets. We do the digging and try to lay it out clearly, without the walls of jargon.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description:
      "The big finance ideas, broken down step by step. Start from zero and actually walk away understanding it.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "A friendly room full of people figuring this out together. A place to ask, share, learn, and grow your confidence along the way.",
  },
];

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading
        eyebrow="What We Do"
        title="Three ways we hope to help"
        subtitle="Research, education, and community. Three sides of the same goal: helping more people feel at home with finance."
      />

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {pillars.map((pillar, i) => (
          <ServiceCard
            key={pillar.title}
            index={String(i + 1).padStart(2, "0")}
            {...pillar}
          />
        ))}
      </div>
    </section>
  );
}
