import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { serverClient } from "@/lib/supabase/server";
import type { Author, Category, EntryRow, MediaItem, TranslationRow } from "@/lib/types";

// Each helper returns empty data without Supabase: layouts and pages render in parallel and
// the admin layout shows the setup notice instead.

export type AdminEntry = EntryRow & { translations: Pick<TranslationRow, "locale" | "title" | "slug" | "is_ready" | "meta_description" | "focus_keyword" | "word_count">[] };

export async function adminEntries() {
  if (!isSupabaseConfigured) return [];
  const sb = await serverClient();
  const { data, error } = await sb
    .from("entries")
    .select("*, translations:entry_translations(locale, title, slug, is_ready, meta_description, focus_keyword, word_count)")
    .order("updated_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return data as AdminEntry[];
}

export async function adminEntry(id: string) {
  if (!isSupabaseConfigured) return null;
  const sb = await serverClient();
  const { data, error } = await sb.from("entries").select("*, translations:entry_translations(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as (EntryRow & { translations: TranslationRow[] }) | null;
}

export async function adminAuthors() {
  if (!isSupabaseConfigured) return [];
  const sb = await serverClient();
  const { data, error } = await sb.from("authors").select("*").order("slug");
  if (error) throw error;
  return data as Author[];
}

export async function adminCategories() {
  if (!isSupabaseConfigured) return [];
  const sb = await serverClient();
  const { data, error } = await sb.from("categories").select("*").order("sort").order("slug");
  if (error) throw error;
  return data as Category[];
}

export async function adminMedia() {
  if (!isSupabaseConfigured) return [];
  const sb = await serverClient();
  const { data, error } = await sb.from("media").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw error;
  return data as MediaItem[];
}
