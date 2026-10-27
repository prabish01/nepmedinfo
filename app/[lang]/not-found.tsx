"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import en from "@/lib/i18n/en";
import ne from "@/lib/i18n/ne";

export default function NotFound() {
  const pathname = usePathname() ?? "/";
  const lang = pathname === "/ne" || pathname.startsWith("/ne/") ? "ne" : "en";
  const t = (lang === "ne" ? ne : en).notFound;
  const prefix = lang === "ne" ? "/ne" : "";
  return (
    <section className="container-x py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-display text-7xl font-semibold tracking-tight text-blue-700">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">{t.title}</h1>
        <p className="mt-3 text-muted">{t.text}</p>
        <form action={`${prefix}/search`} className="mt-8 flex gap-2 rounded-full border border-line bg-white p-1.5 shadow-sm">
          <label htmlFor="nf-q" className="sr-only">
            Search
          </label>
          <input id="nf-q" name="q" className="min-w-0 flex-1 rounded-full bg-transparent px-4 outline-none" />
          <button className="grid h-11 w-11 place-items-center rounded-full bg-blue-700 text-white" aria-label="Search">
            <MagnifyingGlassIcon size={18} weight="bold" />
          </button>
        </form>
        <Link href={prefix || "/"} className="mt-6 inline-block font-medium text-blue-700 hover:underline">
          {t.home}
        </Link>
      </div>
    </section>
  );
}
