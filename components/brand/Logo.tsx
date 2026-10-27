import LogoMark from "./LogoMark";

export default function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={36} />
      <span className={`font-display text-[1.18rem] font-semibold leading-none tracking-[-0.02em] ${light ? "text-white" : "text-ink"}`}>
        Nepal<span className={light ? "text-leaf" : "text-blue-700"}>MedInfo</span>
      </span>
    </span>
  );
}
