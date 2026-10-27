import type { EntryType, Locale } from "@/lib/site";
import type { EntryStatus, TranslationRow } from "@/lib/types";

export type TranslationDraft = Omit<TranslationRow, "entry_id" | "updated_at" | "word_count"> & { id?: string };

export type EntryDraft = {
  id?: string;
  type: EntryType;
  status: EntryStatus;
  category_id: string | null;
  author_id: string | null;
  reviewer_id: string | null;
  cover_url: string | null;
  cover_width: number | null;
  cover_height: number | null;
  cover_credit: string | null;
  featured: boolean;
  published_at: string | null;
  reviewed_at: string | null;
  translations: Partial<Record<Locale, TranslationDraft>>;
};

export type SaveResult =
  | { ok: true; id: string; savedAt: string; status: EntryStatus; published_at: string | null; slugs: Partial<Record<Locale, string>> }
  | { ok: false; error: string; lang?: Locale; field?: string };

export function emptyTranslation(locale: Locale): TranslationDraft {
  return {
    locale,
    slug: "",
    title: "",
    excerpt: "",
    body_html: "",
    key_points: [],
    faqs: [],
    sources: [],
    also_known_as: [],
    meta_title: "",
    meta_description: "",
    focus_keyword: "",
    og_title: "",
    og_description: "",
    og_image_url: "",
    cover_alt: "",
    canonical_url: "",
    noindex: false,
    is_ready: true,
  };
}
