"use client";

import { CheckCircleIcon, InfoIcon, WarningCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { analyse } from "@/lib/admin/seo-check";
import type { TranslationDraft } from "@/lib/admin/types";
import { ogImageUrl } from "@/lib/seo";
import { type EntryType, type Locale, entryPath, site } from "@/lib/site";
import { Counter, Field, Input, Panel, Textarea, Toggle, WidthBar } from "./ui";

export default function SeoPanel({
  t,
  lang,
  type,
  coverUrl,
  onChange,
}: {
  t: TranslationDraft;
  lang: Locale;
  type: EntryType;
  coverUrl: string | null;
  onChange: (patch: Partial<TranslationDraft>) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const { checks, score } = analyse(t, { hasCover: !!coverUrl, isEnglish: lang === "en" });
  const title = t.meta_title || t.title || "Page title";
  const desc = t.meta_description || t.excerpt || "Add a meta description to control the snippet shown in search results.";
  const path = entryPath(lang, type, t.slug || "your-page");
  const ogTitle = t.og_title || t.meta_title || t.title || "Page title";
  const ogDesc = t.og_description || t.meta_description || t.excerpt;
  const ogImg = t.og_image_url || ogImageUrl({ title: t.og_title || t.title || "Nepal Med Info", lang });
  const ring = score >= 80 ? "text-green-600" : score >= 55 ? "text-amber-500" : "text-red-500";
  const failing = checks.filter((c) => !c.ok);
  const shown = showAll ? checks : failing;

  return (
    <>
      <Panel
        title="SEO"
        action={
          <span className={`relative grid h-11 w-11 place-items-center ${ring}`} title="SEO score">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${(score / 100) * 97.4} 97.4`} strokeLinecap="round" />
            </svg>
            <span className="text-[0.78rem] font-bold text-ink">{score}</span>
          </span>
        }
      >
        <Field label="Focus keyword" htmlFor={`kw-${lang}`} hint="The main phrase someone would search, e.g. “dengue symptoms”.">
          <Input id={`kw-${lang}`} lang={lang} value={t.focus_keyword ?? ""} onChange={(e) => onChange({ focus_keyword: e.target.value })} />
        </Field>
        <Field label="SEO title" htmlFor={`mt-${lang}`} counter={<Counter value={(t.meta_title || "").length} min={25} max={60} />} hint="Leave empty to use the page title.">
          <Input id={`mt-${lang}`} lang={lang} value={t.meta_title ?? ""} onChange={(e) => onChange({ meta_title: e.target.value })} placeholder={t.title} />
          <WidthBar text={title} limitPx={580} fontPx={20} />
        </Field>
        <Field label="Meta description" htmlFor={`md-${lang}`} counter={<Counter value={(t.meta_description || "").length} min={110} max={160} />} hint="Leave empty to use the summary.">
          <Textarea id={`md-${lang}`} lang={lang} rows={3} value={t.meta_description ?? ""} onChange={(e) => onChange({ meta_description: e.target.value })} placeholder={t.excerpt} />
          <WidthBar text={desc} limitPx={920} fontPx={14} />
        </Field>

        <div className="rounded-xl bg-ground/70 p-4" aria-label="Google preview">
          <p className="text-[0.72rem] font-semibold text-muted">Google preview</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" className="h-4 w-4" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-[0.8rem] text-ink">{site.name}</p>
              <p className="truncate text-[0.72rem] text-muted">
                {site.domain}
                {path.replace(/\//g, " › ").replace(/^ › /, " › ")}
              </p>
            </div>
          </div>
          <p className="mt-2 line-clamp-1 text-[1.05rem] leading-snug text-[#1a0dab]" lang={lang}>
            {title.length > 60 ? `${title.slice(0, 58)}...` : title}
          </p>
          <p className="mt-1 line-clamp-2 text-[0.82rem] leading-snug text-[#4d5156]" lang={lang}>
            {desc.length > 160 ? `${desc.slice(0, 157)}...` : desc}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-[0.85rem] font-semibold text-ink">{failing.length ? `${failing.length} to improve` : "All checks pass"}</p>
            <button type="button" onClick={() => setShowAll((v) => !v)} className="text-[0.8rem] font-semibold text-blue-700 hover:underline">
              {showAll ? "Show issues only" : "Show all checks"}
            </button>
          </div>
          <ul className="mt-2 space-y-1.5">
            {shown.map((c) => {
              const Icon = c.ok ? CheckCircleIcon : c.level === "error" ? XCircleIcon : c.level === "warn" ? WarningCircleIcon : InfoIcon;
              const color = c.ok ? "text-green-600" : c.level === "error" ? "text-red-600" : c.level === "warn" ? "text-amber-500" : "text-blue-600";
              return (
                <li key={c.id} className="flex gap-2 text-[0.82rem] leading-snug text-ink/80">
                  <Icon size={17} weight="fill" className={`mt-px shrink-0 ${color}`} />
                  {c.text}
                </li>
              );
            })}
          </ul>
        </div>
      </Panel>

      <Panel title="Social sharing">
        <div className="overflow-hidden rounded-xl ring-1 ring-line" aria-label="Social card preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ogImg} alt="" className="aspect-[1200/630] w-full bg-ground object-cover" />
          <div className="bg-ground/70 px-3 py-2.5">
            <p className="text-[0.7rem] uppercase text-muted">{site.domain}</p>
            <p className="line-clamp-1 text-[0.88rem] font-semibold text-ink" lang={lang}>
              {ogTitle}
            </p>
            <p className="line-clamp-1 text-[0.8rem] text-muted" lang={lang}>
              {ogDesc}
            </p>
          </div>
        </div>
        <Field label="Social title" htmlFor={`ogt-${lang}`} counter={<Counter value={(t.og_title || "").length} min={20} max={70} />}>
          <Input id={`ogt-${lang}`} lang={lang} value={t.og_title ?? ""} onChange={(e) => onChange({ og_title: e.target.value })} placeholder={t.meta_title || t.title} />
        </Field>
        <Field label="Social description" htmlFor={`ogd-${lang}`} counter={<Counter value={(t.og_description || "").length} min={50} max={200} />}>
          <Textarea id={`ogd-${lang}`} lang={lang} rows={2} value={t.og_description ?? ""} onChange={(e) => onChange({ og_description: e.target.value })} placeholder={t.meta_description || t.excerpt} />
        </Field>
        <Field label="Custom social image URL" htmlFor={`ogi-${lang}`} hint="Optional, 1200 x 630. Leave empty to use the branded image generated from the title.">
          <Input id={`ogi-${lang}`} value={t.og_image_url ?? ""} onChange={(e) => onChange({ og_image_url: e.target.value })} placeholder="https://" />
        </Field>
      </Panel>

      <Panel title="Advanced">
        <Field label="Canonical URL" htmlFor={`can-${lang}`} hint="Only set this if the same content is published elsewhere first.">
          <Input id={`can-${lang}`} value={t.canonical_url ?? ""} onChange={(e) => onChange({ canonical_url: e.target.value })} placeholder={`${site.url}${path}`} />
        </Field>
        <Toggle id={`noindex-${lang}`} checked={t.noindex} onChange={(v) => onChange({ noindex: v })} label="Hide from search engines" hint="Adds noindex and removes the page from the sitemap." />
      </Panel>
    </>
  );
}
