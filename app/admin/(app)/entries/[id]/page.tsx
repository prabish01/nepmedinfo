import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EntryEditor from "@/components/admin/EntryEditor";
import { adminAuthors, adminCategories, adminEntry } from "@/lib/admin/data";
import type { EntryDraft, TranslationDraft } from "@/lib/admin/types";
import type { Locale } from "@/lib/site";

export const metadata: Metadata = { title: "Edit page" };

export default async function EditEntryPage({ params }: PageProps<"/admin/entries/[id]">) {
  const { id } = await params;
  const [entry, authors, categories] = await Promise.all([adminEntry(id), adminAuthors(), adminCategories()]);
  if (!entry) notFound();
  const translations: Partial<Record<Locale, TranslationDraft>> = {};
  for (const t of entry.translations) {
    translations[t.locale] = {
      id: t.id,
      locale: t.locale,
      slug: t.slug,
      title: t.title,
      excerpt: t.excerpt,
      body_html: t.body_html,
      key_points: t.key_points ?? [],
      faqs: t.faqs ?? [],
      sources: t.sources ?? [],
      also_known_as: t.also_known_as ?? [],
      meta_title: t.meta_title ?? "",
      meta_description: t.meta_description ?? "",
      focus_keyword: t.focus_keyword ?? "",
      og_title: t.og_title ?? "",
      og_description: t.og_description ?? "",
      og_image_url: t.og_image_url ?? "",
      cover_alt: t.cover_alt ?? "",
      canonical_url: t.canonical_url ?? "",
      noindex: t.noindex,
      is_ready: t.is_ready,
    };
  }
  const initial: EntryDraft = {
    id: entry.id,
    type: entry.type,
    status: entry.status,
    category_id: entry.category_id,
    author_id: entry.author_id,
    reviewer_id: entry.reviewer_id,
    cover_url: entry.cover_url,
    cover_width: entry.cover_width,
    cover_height: entry.cover_height,
    cover_credit: entry.cover_credit,
    featured: entry.featured,
    published_at: entry.published_at,
    reviewed_at: entry.reviewed_at,
    translations,
  };
  return <EntryEditor key={entry.id} initial={initial} authors={authors} categories={categories} />;
}
