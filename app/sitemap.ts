import type { MetadataRoute } from "next";
import { getAuthors, getCategories, getSitemapEntries } from "@/lib/content";
import { type Locale, absoluteUrl, entryPath, localeMeta, localePath, locales } from "@/lib/site";

export const revalidate = 3600;

function languages(paths: Partial<Record<Locale, string>>) {
  const out: Record<string, string> = {};
  for (const l of locales) if (paths[l]) out[localeMeta[l].hreflang] = absoluteUrl(paths[l]!);
  if (paths.en) out["x-default"] = absoluteUrl(paths.en);
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, categories, authors] = await Promise.all([getSitemapEntries(), getCategories(), getAuthors()]);
  const latest = entries.reduce((max, e) => (e.updatedAt > max ? e.updatedAt : max), "2026-01-01T00:00:00Z");
  const out: MetadataRoute.Sitemap = [];

  const staticPages: { path: string; priority: number; freq: "daily" | "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, freq: "daily" },
    { path: "/diseases", priority: 0.9, freq: "weekly" },
    { path: "/drugs", priority: 0.9, freq: "weekly" },
    { path: "/articles", priority: 0.8, freq: "daily" },
    { path: "/about", priority: 0.5, freq: "monthly" },
    { path: "/disclaimer", priority: 0.2, freq: "yearly" },
    { path: "/privacy", priority: 0.2, freq: "yearly" },
  ];
  for (const p of staticPages) {
    const paths = Object.fromEntries(locales.map((l) => [l, localePath(l, p.path)]));
    for (const l of locales) {
      out.push({ url: absoluteUrl(paths[l]), lastModified: latest, changeFrequency: p.freq, priority: p.priority, alternates: { languages: languages(paths) } });
    }
  }

  for (const c of categories) {
    const paths = Object.fromEntries(locales.map((l) => [l, localePath(l, `/articles/category/${c.slug}`)]));
    for (const l of locales) out.push({ url: absoluteUrl(paths[l]), lastModified: latest, changeFrequency: "weekly", priority: 0.6, alternates: { languages: languages(paths) } });
  }

  for (const a of authors) {
    const paths = Object.fromEntries(locales.map((l) => [l, localePath(l, `/authors/${a.slug}`)]));
    for (const l of locales) out.push({ url: absoluteUrl(paths[l]), changeFrequency: "monthly", priority: 0.4, alternates: { languages: languages(paths) } });
  }

  for (const e of entries) {
    const paths: Partial<Record<Locale, string>> = {};
    for (const l of locales) {
      const v = e.versions[l];
      if (v && !v.noindex) paths[l] = entryPath(l, e.type, v.slug);
    }
    for (const l of locales) {
      const v = e.versions[l];
      if (!v || v.noindex) continue;
      out.push({
        url: absoluteUrl(paths[l]!),
        lastModified: v.updatedAt,
        changeFrequency: e.type === "article" ? "monthly" : "weekly",
        priority: e.type === "article" ? 0.7 : 0.8,
        alternates: { languages: languages(paths) },
        ...(e.coverUrl ? { images: [absoluteUrl(e.coverUrl)] } : {}),
      });
    }
  }
  return out;
}
