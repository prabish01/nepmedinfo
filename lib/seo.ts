import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { type EntryType, type Locale, absoluteUrl, entryPath, localeMeta, localePath, locales, site } from "@/lib/site";
import type { Author, EntryDetail } from "@/lib/types";

type PageMetaInput = {
  lang: Locale;
  title: string;
  description: string;
  /** Path without locale prefix, e.g. "/diseases". Used when the page exists in every language. */
  path?: string;
  /** Explicit per-language paths (already localised). Overrides `path`. */
  paths?: Partial<Record<Locale, string>>;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
  noindex?: boolean;
  canonical?: string | null;
  publishedTime?: string;
  modifiedTime?: string;
  absoluteTitle?: boolean;
};

export function ogImageUrl(params: { title: string; lang: Locale; kind?: string }) {
  const q = new URLSearchParams({ title: params.title, lang: params.lang });
  if (params.kind) q.set("kind", params.kind);
  return `/api/og?${q.toString()}`;
}

export function pageMetadata(input: PageMetaInput): Metadata {
  const { lang } = input;
  const paths: Partial<Record<Locale, string>> =
    input.paths ?? Object.fromEntries(locales.map((l) => [l, localePath(l, input.path ?? "/")]));
  const self = paths[lang] ?? localePath(lang, input.path ?? "/");
  const languages: Record<string, string> = {};
  for (const l of locales) if (paths[l]) languages[localeMeta[l].hreflang] = absoluteUrl(paths[l]!);
  if (paths.en) languages["x-default"] = absoluteUrl(paths.en);

  const image = input.image ?? ogImageUrl({ title: input.title, lang });
  const dict = getDictionary(lang);

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: input.canonical || absoluteUrl(self), languages },
    robots: input.noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: {
      type: input.type ?? "website",
      url: absoluteUrl(self),
      siteName: dict.meta.siteTitle.split(":")[0],
      title: input.title,
      description: input.description,
      locale: localeMeta[lang].ogLocale,
      alternateLocale: locales.filter((l) => l !== lang && paths[l]).map((l) => localeMeta[l].ogLocale),
      images: [{ url: image, width: 1200, height: 630, alt: input.imageAlt ?? input.title }],
      ...(input.type === "article" ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: [image] },
  };
}

export function entryMetadata(entry: EntryDetail, lang: Locale): Metadata {
  const paths = Object.fromEntries(
    Object.entries(entry.alternates).map(([l, slug]) => [l, entryPath(l as Locale, entry.type, slug!)]),
  ) as Partial<Record<Locale, string>>;
  const title = entry.metaTitle || entry.title;
  const description = entry.metaDescription || entry.excerpt;
  const kind = getDictionary(lang).entry[entry.type];
  const base = pageMetadata({
      lang,
      title,
      description,
      paths,
      type: "article",
      noindex: entry.noindex,
      canonical: entry.canonicalUrl,
      // Nepali: prefer the cover photo, since generated cards cannot shape Devanagari (see app/api/og).
      image: entry.ogImageUrl || (lang === "ne" && entry.coverUrl) || ogImageUrl({ title: entry.ogTitle || entry.title, lang, kind }),
      imageAlt: entry.ogTitle || entry.title,
      publishedTime: entry.publishedAt,
      modifiedTime: entry.updatedAt,
      absoluteTitle: title.length > 45,
  });
  const ogTitle = entry.ogTitle || title;
  const ogDescription = entry.ogDescription || description;
  return {
    ...base,
    openGraph: { ...base.openGraph, title: ogTitle, description: ogDescription },
    twitter: { ...base.twitter, title: ogTitle, description: ogDescription },
    authors: entry.author ? [{ name: entry.author.name[lang] || entry.author.name.en || "" }] : undefined,
    keywords: entry.alsoKnownAs.length ? entry.alsoKnownAs : undefined,
  };
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------
export const orgId = `${site.url}/#organization`;
export const websiteId = `${site.url}/#website`;

export function organizationLd(lang: Locale) {
  const dict = getDictionary(lang);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: site.name,
    alternateName: lang === "ne" ? "नेपाल मेड इन्फो" : "NepalMedInfo",
    url: site.url,
    logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo-512.png"), width: 512, height: 512 },
    description: dict.footer.about,
    email: site.email,
    foundingDate: String(site.foundingYear),
    areaServed: { "@type": "Country", name: "Nepal" },
    sameAs: site.social,
  };
}

export function websiteLd(lang: Locale) {
  const dict = getDictionary(lang);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: site.name,
    url: absoluteUrl(localePath(lang, "/")),
    description: dict.meta.siteDescription,
    inLanguage: ["en", "ne"],
    publisher: { "@id": orgId },
    creator: {
      "@type": "Person",
      "@id": site.developer.id,
      name: site.developer.name,
      url: site.developer.linkedin,
      email: site.developer.email,
      sameAs: [site.developer.linkedin, site.developer.github, ...site.developer.otherSites],
    },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl(localePath(lang, "/search"))}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[], withContext = true) {
  return {
    ...(withContext ? { "@context": "https://schema.org" } : {}),
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function personLd(author: Author, lang: Locale) {
  return {
    "@type": "Person",
    "@id": absoluteUrl(`/authors/${author.slug}#person`),
    name: author.name[lang] || author.name.en,
    url: absoluteUrl(localePath(lang, `/authors/${author.slug}`)),
    ...(author.job_title[lang] || author.job_title.en ? { jobTitle: author.job_title[lang] || author.job_title.en } : {}),
    ...(author.credentials ? { honorificSuffix: author.credentials } : {}),
    ...(author.avatar_url ? { image: absoluteUrl(author.avatar_url) } : {}),
    ...(author.same_as?.length ? { sameAs: author.same_as } : {}),
  };
}

const aboutType: Record<EntryType, string | null> = { disease: "MedicalCondition", drug: "Drug", article: null };

/** MedicalWebPage (diseases, drugs) or Article (articles), plus FAQ when present. */
export function entryLd(entry: EntryDetail, lang: Locale, crumbs: { name: string; path: string }[]) {
  const url = absoluteUrl(entryPath(lang, entry.type, entry.slug));
  const image = entry.coverUrl ? absoluteUrl(entry.coverUrl) : absoluteUrl(ogImageUrl({ title: entry.title, lang }));
  const author = entry.author ? personLd(entry.author, lang) : { "@id": orgId };
  const reviewer = entry.reviewer ? personLd(entry.reviewer, lang) : undefined;
  const about = aboutType[entry.type];

  const page: Record<string, unknown> = {
    "@type": entry.type === "article" ? ["Article", "MedicalWebPage"] : "MedicalWebPage",
    "@id": `${url}#page`,
    url,
    headline: entry.title.slice(0, 110),
    name: entry.title,
    description: entry.metaDescription || entry.excerpt,
    inLanguage: localeMeta[lang].htmlLang,
    image: { "@type": "ImageObject", url: image, ...(entry.coverWidth ? { width: entry.coverWidth, height: entry.coverHeight } : {}) },
    datePublished: entry.publishedAt,
    dateModified: entry.updatedAt,
    ...(entry.reviewedAt ? { lastReviewed: entry.reviewedAt } : {}),
    ...(reviewer ? { reviewedBy: reviewer } : {}),
    author,
    publisher: { "@id": orgId },
    isPartOf: { "@id": websiteId },
    mainEntityOfPage: url,
    audience: { "@type": "PeopleAudience", geographicArea: { "@type": "Country", name: "Nepal" } },
    ...(entry.sources.length
      ? { citation: entry.sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url, ...(s.publisher ? { publisher: s.publisher } : {}) })) }
      : {}),
    ...(about
      ? { about: { "@type": about, name: entry.title, ...(entry.alsoKnownAs.length ? { alternateName: entry.alsoKnownAs } : {}) } }
      : {}),
  };

  const graph: Record<string, unknown>[] = [page, breadcrumbLd(crumbs, false)];
  if (entry.faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: entry.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function collectionLd(lang: Locale, name: string, description: string, path: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: localeMeta[lang].htmlLang,
    isPartOf: { "@id": websiteId },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.slice(0, 100).map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: absoluteUrl(it.path) })),
    },
  };
}
