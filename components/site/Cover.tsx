import Image from "next/image";
import LogoMark from "@/components/brand/LogoMark";

/** Entry cover image, or a quiet branded panel when an entry has no cover yet. */
export default function Cover({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className={`relative grid place-items-center overflow-hidden bg-blue-50 ${className}`} aria-hidden>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-leaf-soft" />
        <LogoMark size={56} className="relative opacity-90" />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-blue-50 ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover transition duration-500 group-hover:scale-[1.03]" />
    </div>
  );
}
