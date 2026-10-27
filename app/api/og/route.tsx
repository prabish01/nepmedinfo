import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brand, markPaths } from "@/lib/brand";

// Dynamic Open Graph card: /api/og?title=...&lang=en|ne&kind=Disease
// Satori cannot shape Devanagari conjuncts (क्ष, स्व...), so Nepali cards are brand-only and the
// Nepali title travels in og:title, which social apps render correctly. Nepali pages with a cover
// photo use the photo instead (see lib/seo.ts).
const fontDir = join(process.cwd(), "assets/fonts");
const fonts = Promise.all([
  readFile(join(fontDir, "sora-latin-600-normal.woff")),
  readFile(join(fontDir, "sora-latin-500-normal.woff")),
  readFile(join(fontDir, "mukta-devanagari-600-normal.woff")),
  readFile(join(fontDir, "mukta-devanagari-700-normal.woff")),
]);

function Mark({ size }: { size: number }) {
  const { crossV: v, crossH: h } = markPaths;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <rect width="48" height="48" rx="13" fill={brand.blue} />
      <path d={markPaths.peaks} fill={brand.leaf} />
      <rect x={v.x} y={v.y} width={v.width} height={v.height} rx={v.rx} fill="#fff" />
      <rect x={h.x} y={h.y} width={h.width} height={h.height} rx={h.rx} fill="#fff" />
    </svg>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") === "ne" ? "ne" : "en";
  const fallback = lang === "ne" ? "नेपालका लागि स्पष्ट स्वास्थ्य जानकारी" : "Clear health information for Nepal";
  const title = (searchParams.get("title") || fallback).slice(0, 140);
  const kind = (searchParams.get("kind") || "").slice(0, 40);
  const [sora600, sora500, mukta600, mukta700] = await fonts;
  const fontList = [
    { name: "Sora", data: sora600, weight: 600 as const, style: "normal" as const },
    { name: "Sora", data: sora500, weight: 500 as const, style: "normal" as const },
    { name: "Mukta", data: mukta600, weight: 600 as const, style: "normal" as const },
    { name: "Mukta", data: mukta700, weight: 700 as const, style: "normal" as const },
  ];
  const headers = { "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400" };

  if (lang === "ne") {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: brand.blue, position: "relative", fontFamily: "Sora" }}>
          <svg viewBox="0 0 1200 260" width={1200} height={260} style={{ position: "absolute", bottom: 0, left: 0 }}>
            <path d="M0 150 L260 70 L390 130 L640 20 L880 120 L1010 80 L1200 160 V260 H0 Z" fill={brand.leaf} />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, marginTop: -110 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 28, background: "#fff", borderRadius: 40, padding: "30px 46px" }}>
              <Mark size={104} />
              <div style={{ display: "flex", fontSize: 74, fontWeight: 600, letterSpacing: -2, color: brand.ink }}>
                Nepal<span style={{ color: brand.blue }}>MedInfo</span>
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 500, color: "#dbe8f8" }}>nepalmedinfo.com</div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts: fontList, headers },
    );
  }

  const len = [...title].length;
  const size = len > 90 ? 50 : len > 60 ? 58 : len > 34 ? 68 : 80;
  const family = "Sora, Mukta";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4f7fb", fontFamily: family }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "64px 56px 60px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Mark size={64} />
            <div style={{ display: "flex", fontFamily: "Sora", fontSize: 34, fontWeight: 600, letterSpacing: -0.8, color: brand.ink }}>
              Nepal<span style={{ color: brand.blue }}>MedInfo</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: size,
              lineHeight: 1.12,
              fontWeight: 600,
              letterSpacing: -1.6,
              color: brand.ink,
              maxWidth: 760,
            }}
          >
            {title}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#52637a", fontFamily: "Sora" }}>
            {kind ? (
              <div style={{ display: "flex", background: brand.leaf, color: brand.navy, borderRadius: 999, padding: "8px 22px", fontWeight: 600, fontFamily: family }}>
                {kind}
              </div>
            ) : null}
            <div style={{ display: "flex", fontWeight: 500 }}>nepalmedinfo.com</div>
          </div>
        </div>

        <div style={{ display: "flex", width: 330, padding: "28px 28px 28px 0" }}>
          <div
            style={{
              display: "flex",
              flex: 1,
              borderRadius: 40,
              background: brand.blue,
              position: "relative",
              overflow: "hidden",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: 120,
            }}
          >
            <div style={{ display: "flex", position: "relative", width: 150, height: 150 }}>
              <div style={{ position: "absolute", left: 51, top: 0, width: 48, height: 150, background: "#fff", borderRadius: 14 }} />
              <div style={{ position: "absolute", left: 0, top: 51, width: 150, height: 48, background: "#fff", borderRadius: 14 }} />
            </div>
            <svg viewBox="0 0 302 200" width={302} height={200} style={{ position: "absolute", bottom: 0, left: 0 }}>
              <path d="M0 110 L80 62 L122 92 L196 30 L302 112 V200 H0 Z" fill={brand.leaf} />
            </svg>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontList,
      headers,
    },
  );
}
