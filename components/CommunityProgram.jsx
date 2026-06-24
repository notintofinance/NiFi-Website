import Image from "next/image";
import { Heart } from "lucide-react";

const photos = [
  {
    src: "/community/nifiberbagi-1.jpg",
    alt: "NiFi community sharing donations at a local mosque",
  },
  {
    src: "/community/nifiberbagi-2.jpg",
    alt: "NiFi team handing over a care package to children",
  },
];

export default function CommunityProgram() {
  return (
    <section className="border-y border-navy-700/50 bg-navy-800/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-bright">
            <Heart size={14} />
            #NiFiBerbagi
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From community, to community
          </h2>
          <p className="text-base leading-relaxed text-slate-400 sm:text-lg">
            Beyond research and education, we believe in giving back.
            #NiFiBerbagi is our community program, where we come together to
            share with those who need it most.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {photos.map((photo) => (
            <div
              key={photo.src}
              className="group relative aspect-video overflow-hidden rounded-2xl border border-navy-600/60 bg-navy-900"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
