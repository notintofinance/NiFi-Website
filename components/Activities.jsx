import Image from "next/image";
import { Heart } from "lucide-react";

function Photo({ src, alt, caption, className }) {
  return (
    <figure
      className={`group relative overflow-hidden rounded-2xl border border-navy-600/60 bg-navy-900 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent p-4 pt-12">
        <span className="text-sm font-medium text-white">{caption}</span>
      </figcaption>
    </figure>
  );
}

export default function Activities() {
  return (
    <section
      id="activities"
      className="border-y border-navy-700/50 bg-navy-800/40"
    >
      <div className="mx-auto max-w-7xl px-6 py-24">
        {/* ============ #NiFiBerbagi ============ */}
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-bright">
            <Heart size={14} />
            #NiFiBerbagi
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From community, to community
          </h2>
          <p className="max-w-xl leading-relaxed text-slate-400">
            Beyond research and education, we believe in giving back to the
            community. Through #NiFiBerbagi, we spend time with and support
            children at local orphanages.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Photo
            src="/community/nifiberbagi-1.jpg"
            alt="NiFiBerbagi giving back to the community at an orphanage"
            caption="Giving back at an orphanage"
            className="aspect-video"
          />
          <Photo
            src="/community/nifiberbagi-2.jpg"
            alt="NiFiBerbagi spending time with children at an orphanage"
            caption="Time with the kids"
            className="aspect-video"
          />
        </div>
      </div>
    </section>
  );
}
