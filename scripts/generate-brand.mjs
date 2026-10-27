// Generates every static brand asset from lib/brand.ts:
//   app/favicon.ico (16, 32, 48), app/icon.svg, app/apple-icon.png,
//   public/brand/{logo-mark.svg, logo-512.png, icon-192.png, icon-512.png, icon-maskable-512.png, logo-lockup.png, logo-lockup-white.png}
// Run: npm run brand
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createElement as h } from "react";
import sharp from "sharp";
import { ImageResponse } from "next/dist/compiled/@vercel/og/index.node.js";
import { brand, markPaths, markSvg } from "../lib/brand.ts";

const root = new URL("..", import.meta.url).pathname;
await mkdir(`${root}public/brand`, { recursive: true });

const png = (svg, size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();

// Mark with a custom inner scale (for maskable / apple icons that need padding and a full-bleed background).
function paddedMark({ scale, radius }) {
  const inner = markSvg({ radius: 13 }).replace(/<svg[^>]*>|<\/svg>/g, "");
  const offset = (48 - 48 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="${radius}" fill="${brand.blue}"/><g transform="translate(${offset} ${offset}) scale(${scale})">${inner}</g></svg>`;
}

// ICO container with embedded PNGs.
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

const mark = markSvg({ size: 48 });
const favSizes = [16, 32, 48];
await writeFile(`${root}app/favicon.ico`, ico(await Promise.all(favSizes.map(async (size) => ({ size, data: await png(mark, size) })))));
await writeFile(`${root}app/icon.svg`, markSvg({ size: 48 }).replace(' width="48" height="48"', ""));
await writeFile(`${root}public/brand/logo-mark.svg`, markSvg({ size: 48 }).replace(' width="48" height="48"', ""));
await writeFile(`${root}app/apple-icon.png`, await png(paddedMark({ scale: 1.0, radius: 0 }), 180));
await writeFile(`${root}public/brand/icon-192.png`, await png(mark, 192));
await writeFile(`${root}public/brand/icon-512.png`, await png(mark, 512));
await writeFile(`${root}public/brand/logo-512.png`, await png(mark, 512));
await writeFile(`${root}public/brand/icon-maskable-512.png`, await png(paddedMark({ scale: 0.72, radius: 0 }), 512));

// Horizontal lockup (mark + wordmark) rendered with the real Sora font.
const sora = await readFile(`${root}assets/fonts/sora-latin-600-normal.woff`);
const { crossV: v, crossH: c } = markPaths;
async function lockup(dark) {
  const el = h(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 36, width: "100%", height: "100%", padding: "0 48px", background: "transparent" } },
    h(
      "svg",
      { viewBox: "0 0 48 48", width: 168, height: 168 },
      h("rect", { width: 48, height: 48, rx: 13, fill: dark ? brand.white : brand.blue }),
      h("path", { d: markPaths.peaks, fill: brand.leaf }),
      h("rect", { ...v, fill: dark ? brand.blue : "#fff" }),
      h("rect", { ...c, fill: dark ? brand.blue : "#fff" }),
    ),
    h(
      "div",
      { style: { display: "flex", fontFamily: "Sora", fontSize: 120, fontWeight: 600, letterSpacing: -3, color: dark ? "#fff" : brand.ink } },
      "Nepal",
      h("span", { style: { color: dark ? brand.leaf : brand.blue } }, "MedInfo"),
    ),
  );
  const res = new ImageResponse(el, { width: 1220, height: 240, fonts: [{ name: "Sora", data: sora, weight: 600, style: "normal" }] });
  return Buffer.from(await res.arrayBuffer());
}
await writeFile(`${root}public/brand/logo-lockup.png`, await lockup(false));
await writeFile(`${root}public/brand/logo-lockup-white.png`, await lockup(true));

console.log("Brand assets written.");
