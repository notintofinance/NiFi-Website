import { Heart } from "lucide-react";
import PhotoCard from "./PhotoCard";

export default function Activities() {
  return (
    <div>
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
        <PhotoCard
          src="/community/nifiberbagi-1.jpg"
          alt="NiFiBerbagi giving back to the community at an orphanage"
          caption="Giving back at an orphanage"
          className="aspect-video"
        />
        <PhotoCard
          src="/community/nifiberbagi-2.jpg"
          alt="NiFiBerbagi spending time with children at an orphanage"
          caption="Time with the kids"
          className="aspect-video"
        />
      </div>
    </div>
  );
}
