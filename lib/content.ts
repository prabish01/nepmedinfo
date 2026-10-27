import "server-only";
import { unstable_cache } from "next/cache";
import { demoAuthors, demoCategories, demoEntries, type DemoEntry } from "@/lib/demo";
import { readingMinutes } from "@/lib/html";
import { type EntryType, type Locale, defaultLocale } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { publicClient } from "@/lib/supabase/public";
import type { Author, Category, EntryDetail, EntryRow, EntrySummary, IndexItem, PublishedRow, TranslationRow } from "@/lib/types";

/** Every public read is tagged with this; the CMS invalidates it on save. */
export const CONTENT_TAG = "content";

function cached<A extends unknown[], R>(key: string, fn: (...args: A) => Promise<R>) {
  return unstable_cache(fn, [key], { tags: [CONTENT_TAG], revalidate: 3600 });
}

// ---------------------------------------------------------------------------
// Demo adapter: turns demo entries into the same row shape as the published_entries view.
// ---------------------------------------------------------------------------
function demoRows(): PublishedRow[] {
  const now = Date.now();
  return demoEntries
    .filter((e) => e.status === "published" && e.published_at && Date.parse(e.published_at) <= now)
    .flatMap((e) =>
      e.translations
        .filter((t) => t.is_ready)
        .map((t) => ({
          translation_id: `${e.id}-${t.locale}`,
          entry_id: e.id,
          type: e.type,
          locale: t.locale,
          slug: t.slug,
          title: t.title,
          excerpt: t.excerpt,
          cover_alt: t.cover_alt,
          also_known_as: t.also_known_as,
          word_count: t.word_count,
          noindex: t.noindex,
          translation_updated_at: e.updated_at,
          cover_url: e.cover_url,
          cover_width: e.cover_width,
          cover_height: e.cover_height,
          featured: e.featured,
          published_at: e.published_at!,
          updated_at: e.updated_at,
          reviewed_at: e.reviewed_at,
          category_id: e.category_id,
          author_id: e.author_id,
          reviewer_id: e.reviewer_id,
        })),
    )
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------
export const getCategories = cached("categories", async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return demoCategories;
  const { data, error } = await publicClient().from("categories").select("*").order("sort").order("slug");
  if (error) throw error;
  return data as Category[];
});

export const getAuthors = cached("authors", async (): Promise<Author[]> => {
  if (!isSupabaseConfigured) return demoAuthors;
  const { data, error } = await publicClient().from("authors").select("*").order("slug");
  if (error) throw error;
  return data as Author[];
});

async function lookups() {
  const [categories, authors] = await Promise.all([getCategories(), getAuthors()]);
  return {
    categories,
    category: (id: string | null) => categories.find((c) => c.id === id) ?? null,
    author: (id: string | null) => authors.find((a) => a.id === id) ?? null,
  };
}

function toSummary(row: PublishedRow, l: Awaited<ReturnType<typeof lookups>>): EntrySummary {
  return {
    id: row.entry_id,
    type: row.type,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverUrl: row.cover_url,
    coverAlt: row.cover_alt ?? "",
    coverWidth: row.cover_width,
    coverHeight: row.cover_height,
    publishedAt: row.published_at,
    updatedAt: row.translation_updated_at > row.updated_at ? row.translation_updated_at : row.updated_at,
    readingMinutes: readingMinutes(row.word_count),
    category: l.category(row.category_id),
    author: l.author(row.author_id),
    alsoKnownAs: row.also_known_as ?? [],
  };
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------
type ListOptions = {
  type?: EntryType;
  categoryId?: string;
  authorId?: string;
  featured?: boolean;
  excludeId?: string;
  limit?: number;
  offset?: number;
};

export const listEntries = cached(
  "listEntries",
  async (lang: Locale, opts: ListOptions = {}): Promise<{ items: EntrySummary[]; total: number }> => {
    const { limit = 12, offset = 0 } = opts;
    const l = await lookups();
    if (!isSupabaseConfigured) {
      const rows = demoRows().filter(
        (r) =>
          r.locale === lang &&
          (!opts.type || r.type === opts.type) &&
          (!opts.categoryId || r.category_id === opts.categoryId) &&
          (!opts.authorId || r.author_id === opts.authorId || r.reviewer_id === opts.authorId) &&
          (!opts.featured || r.featured) &&
          (!opts.excludeId || r.entry_id !== opts.excludeId),
      );
      return { items: rows.slice(offset, offset + limit).map((r) => toSummary(r, l)), total: rows.length };
    }
    let q = publicClient().from("published_entries").select("*", { count: "exact" }).eq("locale", lang);
    if (opts.type) q = q.eq("type", opts.type);
    if (opts.categoryId) q = q.eq("category_id", opts.categoryId);
    if (opts.authorId) q = q.or(`author_id.eq.${opts.authorId},reviewer_id.eq.${opts.authorId}`);
    if (opts.featured) q = q.eq("featured", true);
    if (opts.excludeId) q = q.neq("entry_id", opts.excludeId);
    const { data, error, count } = await q.order("published_at", { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return { items: (data as PublishedRow[]).map((r) => toSummary(r, l)), total: count ?? 0 };
  },
);

async function allPublishedRows(type?: EntryType): Promise<PublishedRow[]> {
  if (!isSupabaseConfigured) return demoRows().filter((r) => !type || r.type === type);
  const out: PublishedRow[] = [];
  for (let from = 0; ; from += 1000) {
    let q = publicClient().from("published_entries").select("*");
    if (type) q = q.eq("type", type);
    const { data, error } = await q.order("published_at", { ascending: false }).range(from, from + 999);
    if (error) throw error;
    out.push(...(data as PublishedRow[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

/** A-Z index for diseases or drugs. Entries without a version in `lang` fall back to English. */
export const getIndex = cached("getIndex", async (lang: Locale, type: EntryType): Promise<IndexItem[]> => {
  const rows = await allPublishedRows(type);
  const byEntry = new Map<string, PublishedRow>();
  for (const r of rows) {
    const current = byEntry.get(r.entry_id);
    if (!current || (r.locale === lang && current.locale !== lang)) byEntry.set(r.entry_id, r);
    else if (current.locale !== lang && r.locale === defaultLocale) byEntry.set(r.entry_id, r);
  }
  const collator = new Intl.Collator(lang === "ne" ? "ne" : "en", { sensitivity: "base" });
  return [...byEntry.values()]
    .map((r) => ({ id: r.entry_id, slug: r.slug, title: r.title, excerpt: r.excerpt, alsoKnownAs: r.also_known_as ?? [], locale: r.locale }))
    .sort((a, b) => collator.compare(a.title, b.title));
});

// ---------------------------------------------------------------------------
// Single entry
// ---------------------------------------------------------------------------
export const getEntry = cached("getEntry", async (lang: Locale, type: EntryType, slug: string): Promise<EntryDetail | null> => {
  let entry: EntryRow | null = null;
  let tr: TranslationRow | null = null;
  let alternates: Partial<Record<Locale, string>> = {};

  if (!isSupabaseConfigured) {
    const now = Date.now();
    const found = demoEntries.find(
      (e: DemoEntry) =>
        e.type === type && e.published_at && Date.parse(e.published_at) <= now && e.translations.some((t) => t.locale === lang && t.slug === slug && t.is_ready),
    );
    if (!found) return null;
    entry = found;
    tr = found.translations.find((t) => t.locale === lang)!;
    alternates = Object.fromEntries(found.translations.filter((t) => t.is_ready).map((t) => [t.locale, t.slug]));
  } else {
    const sb = publicClient();
    const { data: t, error } = await sb.from("entry_translations").select("*").eq("locale", lang).eq("slug", slug).maybeSingle();
    if (error) throw error;
    if (!t) return null;
    const { data: e, error: e2 } = await sb.from("entries").select("*").eq("id", t.entry_id).eq("type", type).maybeSingle();
    if (e2) throw e2;
    if (!e) return null;
    const { data: alts } = await sb.from("entry_translations").select("locale, slug").eq("entry_id", e.id);
    entry = e as EntryRow;
    tr = t as TranslationRow;
    alternates = Object.fromEntries((alts ?? []).map((a) => [a.locale, a.slug]));
  }

  const l = await lookups();
  const updatedAt = tr.updated_at && tr.updated_at > entry.updated_at ? tr.updated_at : entry.updated_at;
  return {
    id: entry.id,
    type: entry.type,
    locale: lang,
    slug: tr.slug,
    title: tr.title,
    excerpt: tr.excerpt,
    coverUrl: entry.cover_url,
    coverAlt: tr.cover_alt ?? "",
    coverWidth: entry.cover_width,
    coverHeight: entry.cover_height,
    coverCredit: entry.cover_credit,
    publishedAt: entry.published_at!,
    updatedAt,
    readingMinutes: readingMinutes(tr.word_count),
    category: l.category(entry.category_id),
    author: l.author(entry.author_id),
    reviewer: l.author(entry.reviewer_id),
    reviewedAt: entry.reviewed_at,
    alsoKnownAs: tr.also_known_as ?? [],
    bodyHtml: tr.body_html,
    keyPoints: tr.key_points ?? [],
    faqs: tr.faqs ?? [],
    sources: tr.sources ?? [],
    metaTitle: tr.meta_title,
    metaDescription: tr.meta_description,
    ogTitle: tr.og_title,
    ogDescription: tr.og_description,
    ogImageUrl: tr.og_image_url,
    canonicalUrl: tr.canonical_url,
    noindex: tr.noindex,
    alternates,
  };
});

/** Slugs to prerender at build time. */
export async function getStaticSlugs(lang: Locale, type: EntryType) {
  try {
    const rows = await allPublishedRows(type);
    return rows.filter((r) => r.locale === lang).map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export const getAuthor = cached("getAuthor", async (slug: string) => {
  const authors = await getAuthors();
  return authors.find((a) => a.slug === slug) ?? null;
});

export const getCategory = cached("getCategory", async (slug: string) => {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
});

// ---------------------------------------------------------------------------
// Search and sitemap
// ---------------------------------------------------------------------------
export type SearchHit = { id: string; type: EntryType; slug: string; title: string; excerpt: string };

export async function searchEntries(lang: Locale, query: string): Promise<SearchHit[]> {
  const q = query.trim().slice(0, 100);
  if (q.length < 2) return [];
  if (!isSupabaseConfigured) {
    const needle = q.toLocaleLowerCase();
    return demoRows()
      .filter((r) => r.locale === lang)
      .map((r) => {
        const title = r.title.toLocaleLowerCase();
        const aka = r.also_known_as.join(" ").toLocaleLowerCase();
        const score = title.startsWith(needle) ? 3 : title.includes(needle) ? 2 : aka.includes(needle) ? 1.5 : r.excerpt.toLocaleLowerCase().includes(needle) ? 1 : 0;
        return { r, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ r }) => ({ id: r.entry_id, type: r.type, slug: r.slug, title: r.title, excerpt: r.excerpt }));
  }
  const { data, error } = await publicClient().rpc("search_entries", { q, lang, max_results: 30 });
  if (error) throw error;
  return (data as { entry_id: string; type: EntryType; slug: string; title: string; excerpt: string }[]).map((d) => ({
    id: d.entry_id,
    type: d.type,
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
  }));
}

export type SitemapEntry = {
  type: EntryType;
  updatedAt: string;
  coverUrl: string | null;
  versions: Partial<Record<Locale, { slug: string; title: string; noindex: boolean; updatedAt: string }>>;
};

export const getSitemapEntries = cached("sitemap", async (): Promise<SitemapEntry[]> => {
  const rows = await allPublishedRows();
  const map = new Map<string, SitemapEntry>();
  for (const r of rows) {
    const updated = r.translation_updated_at > r.updated_at ? r.translation_updated_at : r.updated_at;
    const e = map.get(r.entry_id) ?? { type: r.type, updatedAt: updated, coverUrl: r.cover_url, versions: {} };
    e.versions[r.locale] = { slug: r.slug, title: r.title, noindex: r.noindex, updatedAt: updated };
    if (updated > e.updatedAt) e.updatedAt = updated;
    map.set(r.entry_id, e);
  }
  return [...map.values()];
});
