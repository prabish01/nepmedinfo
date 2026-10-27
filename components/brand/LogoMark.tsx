import { brand, markPaths } from "@/lib/brand";

// Plain SVG attributes only, so the same mark renders in next/og (Satori).
export default function LogoMark({ size = 36, className, inverted = false }: { size?: number; className?: string; inverted?: boolean }) {
  const { crossV: v, crossH: h } = markPaths;
  const bg = inverted ? brand.white : brand.blue;
  const cross = inverted ? brand.blue : brand.white;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
      <rect width="48" height="48" rx="13" fill={bg} />
      <path d={markPaths.peaks} fill={brand.leaf} />
      <rect x={v.x} y={v.y} width={v.width} height={v.height} rx={v.rx} fill={cross} />
      <rect x={h.x} y={h.y} width={h.width} height={h.height} rx={h.rx} fill={cross} />
    </svg>
  );
}
