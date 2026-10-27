import type { Metadata } from "next";
import ArticleListing from "@/components/site/ArticleListing";
import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/site";

function pageNumber(raw: string | string[] | undefined) {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n > 1 ? n : 1;
}

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/articles">): Promise<Metadata> {
  const lang = (await params).lang as Locale;
  const page = pageNumber((await searchParams).page);
  const t = getDictionary(lang).articles;
  return pageMetadata({
    lang,
    title: page > 1 ? `${t.metaTitle} (${page})` : t.metaTitle,
    description: t.metaDescription,
    path: page > 1 ? `/articles?page=${page}` : "/articles",
  });
}

export default async function ArticlesPage({ params, searchParams }: PageProps<"/[lang]/articles">) {
  const lang = (await params).lang as Locale;
  return <ArticleListing lang={lang} page={pageNumber((await searchParams).page)} />;
}
