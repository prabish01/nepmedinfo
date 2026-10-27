import type { EntryType, Locale } from "@/lib/site";

export type Localized = Partial<Record<Locale, string>>;
export type Faq = { q: string; a: string };
export type Source = { title: string; url: string; publisher?: string };
export type EntryStatus = "draft" | "review" | "published" | "archived";

export type Author = {
  id: string;
  slug: string;
  name: Localized;
  credentials: string | null;
  job_title: Localized;
  bio: Localized;
  avatar_url: string | null;
  avatar_alt: Localized;
  nmc_number: string | null;
  same_as: string[];
  is_reviewer: boolean;
};

export type Category = {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  sort: number;
};

export type MediaItem = {
  id: string;
  path: string;
  url: string;
  alt: Localized;
  caption: Localized;
  credit: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
  size_bytes: number | null;
  created_at: string;
};

/** Row shape of entries. */
export type EntryRow = {
  id: string;
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
  created_at: string;
  updated_at: string;
};

/** Row shape of entry_translations. */
export type TranslationRow = {
  id?: string;
  entry_id?: string;
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string;
  body_html: string;
  key_points: string[];
  faqs: Faq[];
  sources: Source[];
  also_known_as: string[];
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  cover_alt: string | null;
  canonical_url: string | null;
  noindex: boolean;
  is_ready: boolean;
  word_count: number;
  updated_at?: string;
};

/** Row shape of the published_entries view. */
export type PublishedRow = {
  translation_id: string;
  entry_id: string;
  type: EntryType;
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string;
  cover_alt: string | null;
  also_known_as: string[];
  word_count: number;
  noindex: boolean;
  translation_updated_at: string;
  cover_url: string | null;
  cover_width: number | null;
  cover_height: number | null;
  featured: boolean;
  published_at: string;
  updated_at: string;
  reviewed_at: string | null;
  category_id: string | null;
  author_id: string | null;
  reviewer_id: string | null;
};

export type EntrySummary = {
  id: string;
  type: EntryType;
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string;
  coverWidth: number | null;
  coverHeight: number | null;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  category: Category | null;
  author: Author | null;
  alsoKnownAs: string[];
};

export type EntryDetail = EntrySummary & {
  bodyHtml: string;
  keyPoints: string[];
  faqs: Faq[];
  sources: Source[];
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  reviewedAt: string | null;
  reviewer: Author | null;
  coverCredit: string | null;
  /** Slug of this entry in every language it is published in. */
  alternates: Partial<Record<Locale, string>>;
};

export type IndexItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  alsoKnownAs: string[];
  locale: Locale;
};
