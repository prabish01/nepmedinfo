import type { TranslationDraft } from "./types";

export type Check = { id: string; ok: boolean; level: "error" | "warn" | "info"; text: string };

const textOf = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const has = (hay: string, needle: string) => !!needle && hay.toLocaleLowerCase().includes(needle.toLocaleLowerCase());

/** On-page SEO and accessibility checks for one language version. */
export function analyse(t: TranslationDraft, opts: { hasCover: boolean; isEnglish: boolean }): { checks: Check[]; score: number } {
  const title = (t.meta_title || t.title).trim();
  const desc = (t.meta_description || t.excerpt).trim();
  const kw = (t.focus_keyword ?? "").trim();
  const body = t.body_html || "";
  const text = textOf(body);
  const words = text ? text.split(" ").length : 0;
  const firstPara = textOf(body.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "");
  const headings = [...body.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)].map((m) => textOf(m[1]));
  const images = [...body.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const missingAlt = images.filter((tag) => !/\balt="[^"]+"/.test(tag)).length;
  const links = [...body.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  const internal = links.filter((h) => h.startsWith("/") || /nepalmedinfo\.com/.test(h)).length;
  const hasH1 = /<h1\b/.test(body);

  const checks: Check[] = [
    { id: "title-len", ok: title.length >= 25 && title.length <= 60, level: "warn", text: `SEO title is ${title.length} characters. Aim for 25 to 60 so it is not cut off in Google.` },
    { id: "desc-len", ok: desc.length >= 110 && desc.length <= 160, level: "warn", text: `Meta description is ${desc.length} characters. Aim for 110 to 160.` },
    { id: "excerpt", ok: t.excerpt.trim().length >= 60, level: "warn", text: "Write a summary of at least 60 characters. It appears under the title and in listings." },
    { id: "kw", ok: !!kw, level: "warn", text: "Set a focus keyword: the main phrase people search for." },
    ...(kw
      ? [
          { id: "kw-title", ok: has(title, kw), level: "warn" as const, text: "Focus keyword appears in the SEO title." },
          { id: "kw-desc", ok: has(desc, kw), level: "warn" as const, text: "Focus keyword appears in the meta description." },
          { id: "kw-intro", ok: has(firstPara, kw), level: "warn" as const, text: "Focus keyword appears in the first paragraph." },
          { id: "kw-heading", ok: headings.some((h) => has(h, kw)), level: "info" as const, text: "Focus keyword appears in at least one subheading." },
          ...(opts.isEnglish
            ? [{ id: "kw-slug", ok: t.slug.includes(kw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")), level: "info" as const, text: "Focus keyword appears in the URL slug." }]
            : []),
        ]
      : []),
    { id: "length", ok: words >= 300, level: "warn", text: `Body has ${words} words. Pages with at least 300 words usually rank better.` },
    { id: "h2", ok: headings.length >= 2, level: "warn", text: "Break the page into sections with at least two H2 or H3 subheadings." },
    { id: "no-h1", ok: !hasH1, level: "error", text: "Do not use H1 inside the body. The page title is already the H1." },
    { id: "img-alt", ok: missingAlt === 0, level: "error", text: missingAlt ? `${missingAlt} image(s) in the body have no alt text.` : "Every image in the body has alt text." },
    ...(opts.hasCover ? [{ id: "cover-alt", ok: !!t.cover_alt?.trim(), level: "error" as const, text: "Cover image has alt text in this language." }] : []),
    { id: "internal", ok: internal >= 1, level: "info", text: "Link to at least one related page on this site." },
    { id: "sources", ok: t.sources.some((s) => s.url.trim()), level: "warn", text: "List at least one trusted source. Medical pages are judged on evidence." },
    { id: "slug", ok: t.slug.length > 0 && t.slug.length <= 60, level: "warn", text: "URL slug is short and readable (60 characters or fewer)." },
  ];

  const weight = { error: 3, warn: 2, info: 1 };
  const total = checks.reduce((n, c) => n + weight[c.level], 0);
  const got = checks.reduce((n, c) => n + (c.ok ? weight[c.level] : 0), 0);
  return { checks, score: Math.round((got / total) * 100) };
}
