import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleListing from "@/components/site/ArticleListing";
import { getCategory } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/site";

function pageNumber(raw: string | string[] | undefined) {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n > 1 ? n : 1;
}

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/articles/category/[category]">): Promise<Metadata> {
  const { lang, category: slug } = await params;
  const page = pageNumber((await searchParams).page);
  const category = await getCategory(slug);
  if (!category) return {};
  const l = lang as Locale;
  const name = category.name[l] || category.name.en || slug;
  return pageMetadata({
    lang: l,
    title: `${name}: ${getDictionary(l).articles.title}${page > 1 ? ` (${page})` : ""}`,
    description: category.description[l] || category.description.en || getDictionary(l).articles.metaDescription,
    path: `/articles/category/${slug}${page > 1 ? `?page=${page}` : ""}`,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/articles/category/[category]">) {
  const { lang, category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  return <ArticleListing lang={lang as Locale} page={pageNumber((await searchParams).page)} category={category} />;
}
