// Brand tokens and the logo mark geometry. Plain SVG so next/og (Satori), the icon
// script and React all render the same mark.
export const brand = {
  blue: "#14509e",
  blueDeep: "#0b2a55",
  navy: "#071d3a",
  leaf: "#9fe08a",
  leafDeep: "#1f7a45",
  sky: "#eef4fb",
  ink: "#0c1a2b",
  white: "#ffffff",
};

export const markPaths = {
  // Two Himalayan peaks sitting on the rounded bottom edge of a 48x48 tile (radius 13).
  peaks: "M0 35.5 L13 28.5 L19.5 32 L31 24.5 L48 35.5 A13 13 0 0 1 35 48 H13 A13 13 0 0 1 0 35 Z",
  // Medical cross in the sky above the peaks.
  crossV: { x: 20.25, y: 6, width: 7.5, height: 19, rx: 2 },
  crossH: { x: 14.5, y: 11.75, width: 19, height: 7.5, rx: 2 },
};

export function markSvg({ size = 48, bg = brand.blue, cross = brand.white, peaks = brand.leaf, radius = 13 } = {}) {
  const { crossV: v, crossH: h } = markPaths;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"><rect width="48" height="48" rx="${radius}" fill="${bg}"/><path d="${markPaths.peaks}" fill="${peaks}"/><rect x="${v.x}" y="${v.y}" width="${v.width}" height="${v.height}" rx="${v.rx}" fill="${cross}"/><rect x="${h.x}" y="${h.y}" width="${h.width}" height="${h.height}" rx="${h.rx}" fill="${cross}"/></svg>`;
}
