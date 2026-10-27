"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/html";

export default function Toc({ items, title }: { items: TocItem[]; title: string }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <nav aria-label={title}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <ol className="mt-3 space-y-0.5 border-l border-line">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "true" : undefined}
              className={`-ml-px block border-l-2 py-1.5 text-[0.9rem] leading-snug transition ${i.level === 3 ? "pl-7" : "pl-4"} ${
                active === i.id ? "border-blue-700 font-medium text-blue-800" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
