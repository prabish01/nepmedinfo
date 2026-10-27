import type { Metadata } from "next";
import EntryEditor from "@/components/admin/EntryEditor";
import { adminAuthors, adminCategories } from "@/lib/admin/data";
import { type EntryDraft, emptyTranslation } from "@/lib/admin/types";
import type { EntryType } from "@/lib/site";

export const metadata: Metadata = { title: "New page" };

export default async function NewEntryPage({ searchParams }: PageProps<"/admin/entries/new">) {
  const raw = (await searchParams).type;
  const type: EntryType = raw === "disease" || raw === "drug" ? raw : "article";
  const [authors, categories] = await Promise.all([adminAuthors(), adminCategories()]);
  const initial: EntryDraft = {
    type,
    status: "draft",
    category_id: null,
    author_id: authors[0]?.id ?? null,
    reviewer_id: null,
    cover_url: null,
    cover_width: null,
    cover_height: null,
    cover_credit: null,
    featured: false,
    published_at: null,
    reviewed_at: null,
    translations: { en: emptyTranslation("en") },
  };
  return <EntryEditor key={type} initial={initial} authors={authors} categories={categories} />;
}
