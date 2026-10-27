import Breadcrumbs from "@/components/site/Breadcrumbs";
import JsonLd from "@/components/site/JsonLd";
import { alphabet, groupByLetter, letterId } from "@/lib/az";
import { getIndex } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { breadcrumbLd, collectionLd } from "@/lib/seo";
import { type Locale, entryPath, localeMeta, localePath } from "@/lib/site";
import AzFilter from "./AzFilter";

/** Shared A-Z listing for diseases and drugs. */
export default async function AzPage({ lang, type }: { lang: Locale; type: "disease" | "drug" }) {
  const dict = getDictionary(lang);
  const t = type === "disease" ? dict.diseases : dict.drugs;
  const section = type === "disease" ? "/diseases" : "/drugs";
  const items = await getIndex(lang, type);

  const groups = groupByLetter(items, lang).map(([letter, list]) => ({
    letter,
    id: letterId(letter),
    items: list.map((i) => ({
      id: i.id,
      title: i.title,
      href: entryPath(i.locale, type, i.slug),
      aka: i.alsoKnownAs,
      excerpt: i.excerpt,
      lang: localeMeta[i.locale].htmlLang,
      badge: i.locale !== lang ? localeMeta[i.locale].short : undefined,
    })),
  }));
  const crumbs = [
    { name: dict.common.home, path: localePath(lang, "/") },
    { name: t.title, path: localePath(lang, section) },
  ];

  return (
    <div className="container-x pt-8">
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          collectionLd(lang, t.metaTitle, t.metaDescription, localePath(lang, section), items.map((i) => ({ name: i.title, path: entryPath(i.locale, type, i.slug) }))),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">{t.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{t.intro}</p>
      </header>
      <div className="mt-10">
        <AzFilter groups={groups} letters={alphabet(lang)} label={t.filter} empty={dict.common.noResults} />
      </div>
    </div>
  );
}
