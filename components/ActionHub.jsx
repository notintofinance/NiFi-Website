import { Users, Compass, Mail } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ActionButton from "./ActionButton";
import { siteConfig } from "@/data/site-config";

// Three primary actions. Links are pulled from data/site-config.js.
const actions = [
  {
    icon: Users,
    label: "Join Our Community",
    description:
      "Spend time with people learning the same things you are. Ask anything, no question is too basic.",
    href: siteConfig.links.community,
    external: false,
  },
  {
    icon: Compass,
    label: "Access Arthara",
    description:
      "Explore Arthara, our platform for going deeper into research and the markets.",
    href: siteConfig.links.arthara,
    external: true,
  },
  {
    icon: Mail,
    label: "Subscribe to Our Free Newsletter",
    description:
      "Get our latest research and plain, simple takes delivered straight to your inbox.",
    href: siteConfig.links.newsletter,
    external: true,
  },
];

export default function ActionHub() {
  return (
    <section id="action-hub" className="border-y border-navy-700/50 bg-navy-800/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          eyebrow="Get Started"
          title="A few ways to get involved"
          subtitle="However you'd like to start, you're welcome here."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {actions.map((action) => (
            <ActionButton key={action.label} {...action} />
          ))}
        </div>
      </div>
    </section>
  );
}
