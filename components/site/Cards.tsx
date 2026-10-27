import { ArrowUpRightIcon, ClockIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { formatDate, localizeDigits } from "@/lib/i18n";
import { type Locale, entryPath } from "@/lib/site";
import type { EntrySummary } from "@/lib/types";
import Cover from "./Cover";

function Meta({ e, lang, t }: { e: EntrySummary; lang: Locale; t: Dictionary["common"] }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] text-muted">
      {e.category && <span className="font-semibold text-green-700">{e.category.name[lang] || e.category.name.en}</span>}
      <time dateTime={e.publishedAt}>{formatDate(e.publishedAt, lang)}</time>
      <span className="inline-flex items-center gap-1">
        <ClockIcon size={14} aria-hidden /> {localizeDigits(e.readingMinutes, lang)} {t.minRead}
      </span>
    </p>
  );
}

/** Large vertical card: image on top. */
export function FeatureCard({ e, lang, t, priority = false }: { e: EntrySummary; lang: Locale; t: Dictionary["common"]; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-line transition hover:ring-blue-200">
      <Cover src={e.coverUrl} alt={e.coverAlt} sizes="(min-width: 1024px) 640px, 100vw" className="aspect-[16/10]" priority={priority} />
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <Meta e={e} lang={lang} t={t} />
        <h3 className="mt-3 text-[1.45rem] font-semibold leading-snug tracking-tight text-ink md:text-[1.65rem]">
          <Link href={entryPath(lang, e.type, e.slug)} className="after:absolute after:inset-0">
            {e.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 leading-relaxed text-muted">{e.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-blue-700">
          {t.readArticle} <ArrowUpRightIcon size={16} weight="bold" className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
}

/** Compact horizontal card: image left, text right. */
export function RowCard({ e, lang, t }: { e: EntrySummary; lang: Locale; t: Dictionary["common"] }) {
  return (
    <article className="group relative grid grid-cols-[104px_minmax(0,1fr)] gap-4 rounded-2xl bg-white p-3 ring-1 ring-line transition hover:ring-blue-200 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5">
      <Cover src={e.coverUrl} alt={e.coverAlt} sizes="150px" className="aspect-square rounded-xl sm:aspect-[4/3.4]" />
      <div className="flex min-w-0 flex-col justify-center py-1 pr-2">
        <Meta e={e} lang={lang} t={t} />
        <h3 className="mt-2 line-clamp-3 text-[1.02rem] font-semibold leading-snug text-ink sm:text-[1.08rem]">
          <Link href={entryPath(lang, e.type, e.slug)} className="after:absolute after:inset-0">
            {e.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}

/** Grid card for listing pages. */
export function GridCard({ e, lang, t }: { e: EntrySummary; lang: Locale; t: Dictionary["common"] }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-line transition hover:ring-blue-200">
      <Cover src={e.coverUrl} alt={e.coverAlt} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-5">
        <Meta e={e} lang={lang} t={t} />
        <h3 className="mt-2.5 text-[1.12rem] font-semibold leading-snug text-ink">
          <Link href={entryPath(lang, e.type, e.slug)} className="after:absolute after:inset-0">
            {e.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-muted">{e.excerpt}</p>
      </div>
    </article>
  );
}
