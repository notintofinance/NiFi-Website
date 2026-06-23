"use client";

import { useEffect, useRef } from "react";

// Picks the right-sized background video at runtime so phones download the
// lighter file instead of the full 1080p clip. The poster covers the brief
// gap before JS selects + loads the source.
export default function HeroVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Respect users who prefer reduced motion — keep the still poster only.
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    video.src = isMobile ? "/hero-bg-mobile.mp4" : "/hero-bg.mp4";
    video.load();
    video.play().catch(() => {
      /* autoplay can be blocked until interaction — poster stays visible */
    });
  }, []);

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      poster="/hero-poster.jpg"
    />
  );
}
