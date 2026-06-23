import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Not Into Finance (NiFi) — Finance for people who are not into finance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo-nifi.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #0a0f24 0%, #070b1a 55%, #0f1733 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img
            src={logoSrc}
            width={84}
            height={84}
            style={{
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          />
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, gap: 10 }}>
            <span>Not Into</span>
            <span style={{ color: "#60a5fa" }}>Finance</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              color: "#93c5fd",
              textTransform: "uppercase",
            }}
          >
            Research · Education · Community
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0 18px",
              fontSize: 66,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 980,
            }}
          >
            <span>Finance, for people who are</span>
            <span style={{ color: "#60a5fa" }}>not into finance.</span>
          </div>
        </div>

        <div style={{ fontSize: 28, color: "#94a3b8" }}>notintofinance.com</div>
      </div>
    ),
    { ...size }
  );
}
