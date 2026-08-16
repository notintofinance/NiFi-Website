import Image from "next/image";

// Shared photo tile used across community galleries — an image with a
// caption that fades in from the bottom on hover.
export default function PhotoCard({ src, alt, caption, className = "" }) {
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
