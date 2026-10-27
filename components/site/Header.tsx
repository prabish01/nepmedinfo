"use client";

import { ListIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/brand/Logo";
import type { Dictionary } from "@/lib/i18n";
import { type Locale, localePath } from "@/lib/site";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ lang, nav }: { lang: Locale; nav: Dictionary["nav"] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const items = [
    { href: localePath(lang, "/diseases"), label: nav.diseases },
    { href: localePath(lang, "/drugs"), label: nav.drugs },
    { href: localePath(lang, "/articles"), label: nav.articles },
    { href: localePath(lang, "/about"), label: nav.about },
  ];
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <div className="container-x flex h-[68px] items-center justify-between gap-4">
        <Link href={localePath(lang, "/")} className="shrink-0 rounded-xl" aria-label="Nepal Med Info home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-[0.93rem] font-medium transition ${
                isActive(item.href) ? "bg-blue-50 text-blue-800" : "text-ink/75 hover:bg-ground hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={localePath(lang, "/search")}
            aria-label={nav.search}
            className="grid h-10 w-10 place-items-center rounded-full text-ink/80 transition hover:bg-ground hover:text-ink"
          >
            <MagnifyingGlassIcon size={20} weight="bold" />
          </Link>
          <div className="hidden sm:block">
            <LanguageSwitcher lang={lang} label={nav.language} />
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? nav.close : nav.menu}
          >
            {open ? <XIcon size={20} weight="bold" /> : <ListIcon size={20} weight="bold" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-line bg-white lg:hidden">
          <nav className="container-x space-y-1 py-4" aria-label="Mobile">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-3 py-3 text-[1.02rem] font-medium text-ink hover:bg-ground"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center justify-between border-t border-line px-3 pt-4">
              <span className="text-sm text-muted">{nav.language}</span>
              <LanguageSwitcher lang={lang} label={nav.language} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
