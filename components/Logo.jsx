import Image from "next/image";

// Reusable brand lockup: the NiFi aperture mark + optional wordmark.
export default function Logo({ size = 36, withWordmark = true, href = "#top" }) {
  const content = (
    <>
      <Image
        src="/logo-nifi.png"
        alt="Not Into Finance (NiFi) logo"
        width={size}
        height={size}
        priority
        className="rounded-lg ring-1 ring-white/15"
      />
      {withWordmark && (
        <span className="text-[17px] font-semibold tracking-tight text-white">
          Not Into Finance
        </span>
      )}
    </>
  );

  if (!href) {
    return <span className="flex items-center gap-2.5">{content}</span>;
  }

  return (
    <a href={href} className="flex items-center gap-2.5">
      {content}
    </a>
  );
}
