"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Group = { letter: string; id: string; items: { id: string; title: string; href: string; aka: string[]; excerpt: string; badge?: string; lang: string }[] };

export default function AzFilter({ groups, letters, label, empty }: { groups: Group[]; letters: string[]; label: string; empty: string }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLocaleLowerCase();
  const filtered = useMemo(
    () =>
      needle
        ? groups
            .map((g) => ({ ...g, items: g.items.filter((i) => `${i.title} ${i.aka.join(" ")}`.toLocaleLowerCase().includes(needle)) }))
            .filter((g) => g.items.length)
        : groups,
    [groups, needle],
  );
  const present = new Set(groups.map((g) => g.letter));

  return (
    <div>
      <div className="sticky top-[68px] z-30 -mx-4 border-b border-line bg-white/90 px-4 py-3 backdrop-blur md:mx-0 md:rounded-2xl md:border md:px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative block md:w-72">
            <span className="sr-only">{label}</span>
            <MagnifyingGlassIcon size={18} weight="bold" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={label}
              className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-3 text-[0.95rem] outline-none transition focus:border-blue-500"
            />
          </label>
          <nav aria-label="A-Z" className="no-scrollbar flex gap-1 overflow-x-auto md:flex-wrap">
            {letters.map((l) =>
              present.has(l) ? (
                <a
                  key={l}
                  href={`#letter-${encodeURIComponent(l)}`}
                  className="grid h-8 min-w-8 shrink-0 place-items-center rounded-full px-1.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-700 hover:text-white"
                >
                  {l}
                </a>
              ) : (
                <span key={l} aria-hidden className="grid h-8 min-w-8 shrink-0 place-items-center px-1.5 text-sm text-muted/50">
                  {l}
                </span>
              ),
            )}
          </nav>
        </div>
      </div>

      <div className="mt-10 space-y-12">
        {filtered.map((g) => (
          <section key={g.letter} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-40 grid gap-4 md:grid-cols-[88px_minmax(0,1fr)]">
            <h2 id={`${g.id}-h`} className="font-display text-4xl font-semibold text-blue-700">
              {g.letter}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {g.items.map((i) => (
                <li key={i.id}>
                  <Link href={i.href} lang={i.lang} className="group block h-full rounded-2xl bg-white p-5 ring-1 ring-line transition hover:ring-blue-200">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-[1.08rem] font-semibold text-ink group-hover:text-blue-700">{i.title}</span>
                      {i.badge && <span className="shrink-0 rounded-full bg-ground px-2 py-0.5 text-[0.72rem] font-semibold text-muted">{i.badge}</span>}
                    </span>
                    {i.aka.length > 0 && <span className="mt-1 block text-sm text-muted">{i.aka.slice(0, 3).join(", ")}</span>}
                    <span className="mt-2 line-clamp-2 block text-[0.92rem] leading-relaxed text-muted">{i.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {filtered.length === 0 && <p className="py-10 text-center text-muted">{empty}</p>}
      </div>
    </div>
  );
}
