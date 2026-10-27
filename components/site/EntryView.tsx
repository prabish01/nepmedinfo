import { CaretDownIcon, CheckCircleIcon, ClockIcon, InfoIcon, SealCheckIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { GridCard } from "@/components/site/Cards";
import JsonLd from "@/components/site/JsonLd";
import { SetAlternates } from "@/components/site/Alternates";
import Share from "@/components/site/Share";
import Toc from "@/components/site/Toc";
import LogoMark from "@/components/brand/LogoMark";
import { listEntries } from "@/lib/content";
import { prepareBody } from "@/lib/html";
import { formatDate, getDictionary, localizeDigits } from "@/lib/i18n";
import { entryLd } from "@/lib/seo";
import { type Locale, absoluteUrl, entryPath, localePath, locales, sectionPath } from "@/lib/site";
import type { Author, EntryDetail } from "@/lib/types";

function Person({ a, lang, label }: { a: Author; lang: Locale; label: string }) {
  const name = a.name[lang] || a.name.en;
  return (
    <div className="flex items-center gap-3">
      {a.avatar_url ? (
        <Image src={a.avatar_url} alt={a.avatar_alt[lang] || name || ""} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <LogoMark size={40} />
      )}
      <div className="min-w-0 text-[0.88rem] leading-tight">
        <p className="text-muted">{label}</p>
        <Link href={localePath(lang, `/authors/${a.slug}`)} className="font-semibold text-ink hover:text-blue-700">
          {name}
          {a.credentials ? <span className="font-normal text-muted">, {a.credentials}</span> : null}
        </Link>
      </div>
    </div>
  );
}

export default async function EntryView({ entry, lang }: { entry: EntryDetail; lang: Locale }) {
  const dict = getDictionary(lang);
  const t = dict.entry;
  const sectionTitle = { disease: dict.nav.diseases, drug: dict.nav.drugs, article: dict.nav.articles }[entry.type];
  const { html, toc } = prepareBody(entry.bodyHtml);
  const url = absoluteUrl(entryPath(lang, entry.type, entry.slug));

  const crumbs = [
    { name: dict.common.home, path: localePath(lang, "/") },
    { name: sectionTitle, path: localePath(lang, sectionPath[entry.type]) },
    ...(entry.category ? [{ name: entry.category.name[lang] || entry.category.name.en || "", path: localePath(lang, `/articles/category/${entry.category.slug}`) }] : []),
    { name: entry.title, path: entryPath(lang, entry.type, entry.slug) },
  ];

  // Language switcher: the same entry in the other language, or that language's section index.
  const switchPaths = Object.fromEntries(
    locales.map((l) => [l, entry.alternates[l] ? entryPath(l, entry.type, entry.alternates[l]!) : localePath(l, sectionPath[entry.type])]),
  ) as Record<Locale, string>;

  const related = await listEntries(lang, {
    type: entry.type,
    categoryId: entry.type === "article" ? entry.category?.id : undefined,
    excludeId: entry.id,
    limit: 3,
  });

  const tocItems = [
    ...(entry.keyPoints.length ? [{ id: "key-points", text: t.keyPoints, level: 2 as const }] : []),
    ...toc,
    ...(entry.faqs.length ? [{ id: "faqs", text: t.faqs, level: 2 as const }] : []),
    ...(entry.sources.length ? [{ id: "sources", text: t.sources, level: 2 as const }] : []),
  ];

  return (
    <article className="pt-8">
      <JsonLd data={entryLd(entry, lang, crumbs)} />
      <SetAlternates paths={switchPaths} />

      <div className="container-x">
        <Breadcrumbs items={crumbs} />

        <header className="mt-6 max-w-4xl">
          <h1 className="text-[2.2rem] font-semibold leading-[1.12] tracking-[-0.025em] text-ink md:text-5xl">{entry.title}</h1>
          {entry.alsoKnownAs.length > 0 && (
            <p className="mt-3 text-muted">
              {entry.alsoKnownAs.join(" · ")}
            </p>
          )}
          <p className="mt-5 max-w-[68ch] text-lg leading-relaxed text-ink/75 md:text-xl">{entry.excerpt}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-line py-4">
            {entry.author && <Person a={entry.author} lang={lang} label={t.writtenBy} />}
            {entry.reviewer && (
              <div className="flex items-center gap-2">
                <SealCheckIcon size={22} weight="fill" className="shrink-0 text-green-600" aria-hidden />
                <Person a={entry.reviewer} lang={lang} label={t.reviewedBy} />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[0.88rem]">
              <p>
                <span className="block text-muted">{entry.reviewedAt ? t.lastReviewed : dict.common.updated}</span>
                <time dateTime={entry.reviewedAt ?? entry.updatedAt} className="font-semibold text-ink">
                  {formatDate(entry.reviewedAt ?? entry.updatedAt, lang)}
                </time>
              </p>
              <p className="inline-flex items-center gap-1.5 self-end text-muted">
                <ClockIcon size={15} aria-hidden /> {localizeDigits(entry.readingMinutes, lang)} {dict.common.minRead}
              </p>
            </div>
          </div>
        </header>

        {entry.coverUrl && (
          <figure className="mt-8">
            <div className="relative aspect-[16/8] overflow-hidden rounded-3xl bg-blue-50">
              <Image src={entry.coverUrl} alt={entry.coverAlt} fill priority sizes="(min-width: 1280px) 1184px, 100vw" className="object-cover" />
            </div>
            {entry.coverCredit && <figcaption className="mt-2 text-right text-[0.78rem] text-muted">{entry.coverCredit}</figcaption>}
          </figure>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <Toc items={tocItems} title={t.onThisPage} />
            </div>
          </aside>

          <div className="min-w-0 max-w-[720px]">
            {entry.keyPoints.length > 0 && (
              <section id="key-points" className="scroll-mt-28 rounded-3xl bg-leaf-soft p-6 md:p-7" aria-labelledby="key-points-h">
                <h2 id="key-points-h" className="text-lg font-semibold text-navy">
                  {t.keyPoints}
                </h2>
                <ul className="mt-4 space-y-3">
                  {entry.keyPoints.map((k) => (
                    <li key={k} className="flex gap-3 leading-relaxed text-ink/85">
                      <CheckCircleIcon size={22} weight="fill" className="mt-0.5 shrink-0 text-green-600" aria-hidden />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className={`prose-med ${entry.keyPoints.length ? "mt-10" : ""}`} dangerouslySetInnerHTML={{ __html: html }} />

            {entry.faqs.length > 0 && (
              <section id="faqs" className="mt-14 scroll-mt-28" aria-labelledby="faqs-h">
                <h2 id="faqs-h" className="text-[1.6rem] font-semibold tracking-tight text-ink">
                  {t.faqs}
                </h2>
                <div className="mt-5 divide-y divide-line rounded-3xl bg-white ring-1 ring-line">
                  {entry.faqs.map((f, i) => (
                    <details key={i} className="group px-6 py-1" open={i === 0}>
                      <summary className="flex list-none items-center justify-between gap-4 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                        {f.q}
                        <CaretDownIcon size={18} weight="bold" className="shrink-0 text-blue-700 transition group-open:rotate-180" aria-hidden />
                      </summary>
                      <p className="pb-5 leading-relaxed text-muted">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {entry.sources.length > 0 && (
              <section id="sources" className="mt-14 scroll-mt-28" aria-labelledby="sources-h">
                <h2 id="sources-h" className="text-[1.6rem] font-semibold tracking-tight text-ink">
                  {t.sources}
                </h2>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-[0.95rem] text-muted marker:text-blue-600">
                  {entry.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline decoration-blue-700/30 underline-offset-[3px] hover:decoration-blue-700">
                        {s.title}
                      </a>
                      {s.publisher ? <span>. {s.publisher}</span> : null}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <aside className="mt-12 flex gap-3 rounded-2xl bg-blue-50 p-5 text-[0.93rem] leading-relaxed text-ink/80">
              <InfoIcon size={22} weight="fill" className="mt-0.5 shrink-0 text-blue-700" aria-hidden />
              <p>
                {t.disclaimer}{" "}
                <Link href={localePath(lang, "/disclaimer")} className="font-semibold text-blue-700 hover:underline">
                  {dict.footer.disclaimer}
                </Link>
              </p>
            </aside>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <Share url={url} title={entry.title} labels={{ share: t.share, copyLink: t.copyLink, copied: t.copied }} />
              {entry.publishedAt && (
                <p className="text-[0.85rem] text-muted">
                  {dict.common.published} <time dateTime={entry.publishedAt}>{formatDate(entry.publishedAt, lang)}</time>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.items.length > 0 && (
        <section className="container-x mt-24" aria-labelledby="related-h">
          <h2 id="related-h" className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            {t.related}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.items.map((e) => (
              <GridCard key={e.id} e={e} lang={lang} t={dict.common} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
