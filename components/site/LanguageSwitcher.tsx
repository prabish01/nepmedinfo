"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale, localeMeta, localePath, locales } from "@/lib/site";
import { useAlternates } from "./Alternates";

function stripLocale(pathname: string) {
  const parts = pathname.split("/");
  return parts[1] === "ne" ? `/${parts.slice(2).join("/")}` : pathname;
}

export default function LanguageSwitcher({ lang, label, className = "" }: { lang: Locale; label: string; className?: string }) {
  const pathname = usePathname() || "/";
  const alternates = useAlternates();
  const base = stripLocale(pathname);

  return (
    <div role="group" aria-label={label} className={`inline-flex items-center rounded-full bg-ground p-1 ${className}`}>
      {locales.map((l) => {
        const href = alternates?.[l] ?? localePath(l, base);
        const active = l === lang;
        return (
          <Link
            key={l}
            href={href}
            hrefLang={localeMeta[l].hreflang}
            lang={localeMeta[l].htmlLang}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              try {
                document.cookie = `nmi_lang=${l}; path=/; max-age=31536000; samesite=lax`;
              } catch {}
            }}
            className={`rounded-full px-3 py-1.5 text-[0.82rem] font-semibold transition ${
              active ? "bg-white text-blue-800 shadow-[0_1px_3px_rgba(11,42,85,0.15)]" : "text-muted hover:text-ink"
            }`}
          >
            {localeMeta[l].short}
            <span className="sr-only"> {localeMeta[l].label}</span>
          </Link>
        );
      })}
    </div>
  );
}
