import { PhoneCallIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import type { Dictionary } from "@/lib/i18n";
import { localizeDigits } from "@/lib/i18n";
import { type Locale, localePath, site } from "@/lib/site";

export default function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const f = dict.footer;
  const explore = [
    { href: "/diseases", label: dict.nav.diseases },
    { href: "/drugs", label: dict.nav.drugs },
    { href: "/articles", label: dict.nav.articles },
    { href: "/search", label: dict.nav.search },
  ];
  const company = [
    { href: "/about", label: f.aboutUs },
    { href: "/about#standards", label: f.editorial },
    { href: "/disclaimer", label: f.disclaimer },
    { href: "/privacy", label: f.privacy },
  ];

  return (
    <footer className="mt-24 bg-navy text-white">
      <div className="container-x">
        <div className="flex flex-col gap-4 border-b border-white/10 py-6 sm:flex-row sm:items-center">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf text-navy">
            <PhoneCallIcon size={20} weight="bold" />
          </span>
          <p className="text-[0.95rem] leading-relaxed text-white/80">{dict.common.emergency}</p>
        </div>

        <div className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo light />
            <p className="mt-5 text-[0.95rem] leading-relaxed text-white/70">{f.about}</p>
            <a href={`mailto:${site.email}`} className="mt-4 inline-block text-[0.95rem] font-medium text-leaf hover:underline">
              {site.email}
            </a>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{f.explore}</h2>
            <ul className="mt-4 space-y-2.5">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={localePath(lang, l.href)} className="text-[0.95rem] text-white/70 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{f.company}</h2>
            <ul className="mt-4 space-y-2.5">
              {company.map((l) => (
                <li key={l.href}>
                  <Link href={localePath(lang, l.href)} className="text-[0.95rem] text-white/70 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-[0.85rem] text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {localizeDigits(new Date().getFullYear(), lang)} {site.name}. {f.rights}
          </p>
          <p className="max-w-xl md:text-right">{f.notAdvice}</p>
        </div>
      </div>
    </footer>
  );
}
