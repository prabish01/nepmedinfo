import Link from "next/link";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { FeatureCard, GridCard } from "@/components/site/Cards";
import JsonLd from "@/components/site/JsonLd";
import Pagination from "@/components/site/Pagination";
import { getCategories, listEntries } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { breadcrumbLd, collectionLd } from "@/lib/seo";
import { type Locale, entryPath, localePath } from "@/lib/site";
import type { Category } from "@/lib/types";

export const PER_PAGE = 12;

export default async function ArticleListing({ lang, page, category }: { lang: Locale; page: number; category?: Category }) {
  const dict = getDictionary(lang);
  const t = dict.articles;
  const [categories, { items, total }] = await Promise.all([
    getCategories(),
    listEntries(lang, { type: "article", categoryId: category?.id, limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const base = category ? localePath(lang, `/articles/category/${category.slug}`) : localePath(lang, "/articles");
  const title = category ? category.name[lang] || category.name.en || t.title : t.title;
  const intro = category ? category.description[lang] || category.description.en || t.intro : t.intro;
  const [lead, ...rest] = page === 1 ? items : [undefined, ...items];

  const crumbs = [
    { name: dict.common.home, path: localePath(lang, "/") },
    { name: t.title, path: localePath(lang, "/articles") },
    ...(category ? [{ name: title, path: base }] : []),
  ];

  const pill = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-[0.9rem] font-semibold transition ${
      active ? "bg-blue-700 text-white" : "bg-white text-ink ring-1 ring-line hover:ring-blue-200 hover:text-blue-700"
    }`;

  return (
    <div className="container-x pt-8">
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          collectionLd(lang, title, intro, base, items.map((e) => ({ name: e.title, path: entryPath(lang, "article", e.slug) }))),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>
      </header>

      {categories.length > 0 && (
        <nav aria-label={t.categories} className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <Link href={localePath(lang, "/articles")} className={pill(!category)} aria-current={!category ? "page" : undefined}>
            {dict.common.all}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={localePath(lang, `/articles/category/${c.slug}`)}
              className={pill(category?.id === c.id)}
              aria-current={category?.id === c.id ? "page" : undefined}
            >
              {c.name[lang] || c.name.en}
            </Link>
          ))}
        </nav>
      )}

      {items.length === 0 ? (
        <p className="mt-16 rounded-3xl bg-ground p-10 text-center text-muted">{dict.common.noResults}</p>
      ) : (
        <>
          {lead && (
            <div className="mt-10">
              <FeatureCard e={lead} lang={lang} t={dict.common} priority />
            </div>
          )}
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.filter(Boolean).map((e) => (
              <GridCard key={e!.id} e={e!} lang={lang} t={dict.common} />
            ))}
          </div>
        </>
      )}
      <Pagination lang={lang} page={page} pages={pages} t={dict.common} hrefFor={(p) => (p === 1 ? base : `${base}?page=${p}`)} />
    </div>
  );
}
