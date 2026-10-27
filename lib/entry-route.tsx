import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EntryView from "@/components/site/EntryView";
import { getEntry, getStaticSlugs } from "@/lib/content";
import { entryMetadata } from "@/lib/seo";
import { type EntryType, type Locale, isLocale } from "@/lib/site";

type Params = Promise<{ lang: string; slug: string }>;

/** Shared implementation for /diseases/[slug], /drugs/[slug] and /articles/[slug]. */
export function entryRoute(type: EntryType) {
  return {
    async generateStaticParams({ params }: { params: { lang: string } }) {
      return isLocale(params.lang) ? getStaticSlugs(params.lang, type) : [];
    },
    async generateMetadata({ params }: { params: Params }): Promise<Metadata> {
      const { lang, slug } = await params;
      const entry = await getEntry(lang as Locale, type, decodeURIComponent(slug));
      return entry ? entryMetadata(entry, lang as Locale) : { robots: { index: false } };
    },
    async Page({ params }: { params: Params }) {
      const { lang, slug } = await params;
      const entry = await getEntry(lang as Locale, type, decodeURIComponent(slug));
      if (!entry) notFound();
      return <EntryView entry={entry} lang={lang as Locale} />;
    },
  };
}
