import type { Metadata } from "next";
import AzPage from "@/components/site/AzPage";
import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[lang]/drugs">): Promise<Metadata> {
  const lang = (await params).lang as Locale;
  const t = getDictionary(lang).drugs;
  return pageMetadata({ lang, title: t.metaTitle, description: t.metaDescription, path: "/drugs" });
}

export default async function DrugsPage({ params }: PageProps<"/[lang]/drugs">) {
  return <AzPage lang={(await params).lang as Locale} type="drug" />;
}
