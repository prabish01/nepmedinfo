"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import type { EntryDraft, SaveResult } from "@/lib/admin/types";
import { CONTENT_TAG } from "@/lib/content";
import { countWords, sanitizeBody } from "@/lib/html";
import { locales } from "@/lib/site";
import { isValidSlug } from "@/lib/slug";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { serverClient } from "@/lib/supabase/server";
import type { Localized } from "@/lib/types";

function purge() {
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

const clean = (s: string | null | undefined) => {
  const v = (s ?? "").trim();
  return v.length ? v : null;
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function signIn(_: unknown, form: FormData): Promise<{ error?: string }> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const sb = await serverClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: "Those details did not match an account." };
  redirect("/admin");
}

export async function signOut() {
  const sb = await serverClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------
export async function saveEntry(draft: EntryDraft): Promise<SaveResult> {
  const { sb, session } = await requireStaff();

  const present = locales.filter((l) => {
    const t = draft.translations[l];
    return t && (t.title.trim() || t.body_html.replace(/<[^>]+>/g, "").trim());
  });
  if (!present.length) return { ok: false, error: "Add a title in at least one language." };

  for (const l of present) {
    const t = draft.translations[l]!;
    if (!t.title.trim()) return { ok: false, error: "Title is required.", lang: l, field: "title" };
    if (!isValidSlug(t.slug)) return { ok: false, error: "Use lowercase letters, numbers and hyphens in the URL slug.", lang: l, field: "slug" };
    const { data: clash } = await sb.from("entry_translations").select("entry_id").eq("locale", l).eq("slug", t.slug).maybeSingle();
    if (clash && clash.entry_id !== draft.id) return { ok: false, error: `The URL "${t.slug}" is already used by another page.`, lang: l, field: "slug" };
  }

  if (draft.status === "published") {
    if (!present.some((l) => draft.translations[l]!.is_ready)) return { ok: false, error: "Turn on at least one language version before publishing." };
    if (draft.cover_url && present.some((l) => !draft.translations[l]!.cover_alt?.trim()))
      return { ok: false, error: "Add alt text for the cover image in every language before publishing.", field: "cover_alt" };
  }

  const publishedAt = draft.status === "published" ? draft.published_at || new Date().toISOString() : draft.published_at;
  const row = {
    type: draft.type,
    status: draft.status,
    category_id: draft.type === "article" ? draft.category_id : null,
    author_id: draft.author_id,
    reviewer_id: draft.reviewer_id,
    cover_url: clean(draft.cover_url),
    cover_width: draft.cover_width,
    cover_height: draft.cover_height,
    cover_credit: clean(draft.cover_credit),
    featured: draft.featured,
    published_at: publishedAt,
    reviewed_at: draft.reviewed_at || null,
  };

  let id = draft.id;
  if (id) {
    const { error } = await sb.from("entries").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await sb.from("entries").insert({ ...row, created_by: session.userId }).select("id").single();
    if (error) return { ok: false, error: error.message };
    id = data.id as string;
  }

  const rows = present.map((l) => {
    const t = draft.translations[l]!;
    const body = sanitizeBody(t.body_html);
    return {
      entry_id: id,
      locale: l,
      slug: t.slug,
      title: t.title.trim(),
      excerpt: t.excerpt.trim(),
      body_html: body,
      word_count: countWords(body),
      key_points: t.key_points.map((k) => k.trim()).filter(Boolean),
      faqs: t.faqs.filter((f) => f.q.trim() && f.a.trim()).map((f) => ({ q: f.q.trim(), a: f.a.trim() })),
      sources: t.sources.filter((s) => s.title.trim() && s.url.trim()).map((s) => ({ title: s.title.trim(), url: s.url.trim(), publisher: s.publisher?.trim() || undefined })),
      also_known_as: t.also_known_as.map((a) => a.trim()).filter(Boolean),
      meta_title: clean(t.meta_title),
      meta_description: clean(t.meta_description),
      focus_keyword: clean(t.focus_keyword),
      og_title: clean(t.og_title),
      og_description: clean(t.og_description),
      og_image_url: clean(t.og_image_url),
      cover_alt: clean(t.cover_alt),
      canonical_url: clean(t.canonical_url),
      noindex: t.noindex,
      is_ready: t.is_ready,
    };
  });
  const { error: trErr } = await sb.from("entry_translations").upsert(rows, { onConflict: "entry_id,locale" });
  if (trErr) return { ok: false, error: trErr.message };

  const absent = locales.filter((l) => !present.includes(l));
  if (absent.length) await sb.from("entry_translations").delete().eq("entry_id", id).in("locale", absent);

  purge();
  return {
    ok: true,
    id: id!,
    savedAt: new Date().toISOString(),
    status: draft.status,
    published_at: publishedAt,
    slugs: Object.fromEntries(present.map((l) => [l, draft.translations[l]!.slug])),
  };
}

export async function deleteEntry(id: string) {
  const { sb } = await requireStaff();
  const { error } = await sb.from("entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  purge();
  redirect("/admin");
}

export async function setEntryStatus(id: string, status: "draft" | "published" | "archived") {
  const { sb } = await requireStaff();
  const patch: Record<string, unknown> = { status };
  if (status === "published") {
    const { data } = await sb.from("entries").select("published_at").eq("id", id).single();
    if (!data?.published_at) patch.published_at = new Date().toISOString();
  }
  const { error } = await sb.from("entries").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  purge();
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------
export async function createMedia(input: {
  path: string;
  url: string;
  alt: Localized;
  caption?: Localized;
  credit?: string;
  width: number | null;
  height: number | null;
  mime: string;
  size_bytes: number;
}) {
  const { sb, session } = await requireStaff();
  if (!input.alt.en?.trim() && !input.alt.ne?.trim()) throw new Error("Alt text is required.");
  const { data, error } = await sb
    .from("media")
    .insert({ ...input, caption: input.caption ?? {}, credit: clean(input.credit), created_by: session.userId })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
  return data;
}

export async function updateMedia(id: string, patch: { alt?: Localized; caption?: Localized; credit?: string | null }) {
  const { sb } = await requireStaff();
  const { data, error } = await sb.from("media").update(patch).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
  return data;
}

export async function deleteMedia(id: string) {
  const { sb } = await requireStaff();
  const { data } = await sb.from("media").select("path").eq("id", id).single();
  if (data?.path) await sb.storage.from(MEDIA_BUCKET).remove([data.path]);
  const { error } = await sb.from("media").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/media");
}

export async function listMedia() {
  const { sb } = await requireStaff();
  const { data, error } = await sb.from("media").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Authors and categories
// ---------------------------------------------------------------------------
export async function saveAuthor(input: {
  id?: string;
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
}) {
  const { sb } = await requireStaff();
  if (!isValidSlug(input.slug)) return { ok: false as const, error: "Slug must use lowercase letters, numbers and hyphens." };
  if (!input.name.en?.trim()) return { ok: false as const, error: "English name is required." };
  const { id, ...row } = { ...input, credentials: clean(input.credentials), nmc_number: clean(input.nmc_number), avatar_url: clean(input.avatar_url) };
  const res = id ? await sb.from("authors").update(row).eq("id", id) : await sb.from("authors").insert(row);
  if (res.error) return { ok: false as const, error: res.error.code === "23505" ? "That slug is already taken." : res.error.message };
  purge();
  revalidatePath("/admin/authors");
  return { ok: true as const };
}

export async function deleteAuthor(id: string) {
  const { sb } = await requireStaff();
  const { error } = await sb.from("authors").delete().eq("id", id);
  if (error) throw new Error(error.message);
  purge();
  revalidatePath("/admin/authors");
}

export async function saveCategory(input: { id?: string; slug: string; name: Localized; description: Localized; sort: number }) {
  const { sb } = await requireStaff();
  if (!isValidSlug(input.slug)) return { ok: false as const, error: "Slug must use lowercase letters, numbers and hyphens." };
  if (!input.name.en?.trim()) return { ok: false as const, error: "English name is required." };
  const { id, ...row } = input;
  const res = id ? await sb.from("categories").update(row).eq("id", id) : await sb.from("categories").insert(row);
  if (res.error) return { ok: false as const, error: res.error.code === "23505" ? "That slug is already taken." : res.error.message };
  purge();
  revalidatePath("/admin/categories");
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  const { sb } = await requireStaff();
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  purge();
  revalidatePath("/admin/categories");
}

