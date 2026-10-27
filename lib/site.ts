export const site = {
  name: "Nepal Med Info",
  shortName: "NepalMedInfo",
  domain: "nepalmedinfo.com",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.nepalmedinfo.com").replace(/\/$/, ""),
  email: "hello@nepalmedinfo.com",
  foundingYear: 2026,
  locationCountry: "NP",
  social: [] as string[],
  // Site credit in the footer and WebSite JSON-LD.
  developer: {
    name: "Prabish Dangi",
    email: "prabishdc2002@gmail.com",
    github: "https://github.com/prabish01",
    linkedin: "https://www.linkedin.com/in/prabish-dangi-04a649211/",
  },
};

export const locales = ["en", "ne"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeMeta: Record<Locale, { label: string; short: string; htmlLang: string; ogLocale: string; hreflang: string }> = {
  en: { label: "English", short: "EN", htmlLang: "en", ogLocale: "en_US", hreflang: "en" },
  ne: { label: "नेपाली", short: "ने", htmlLang: "ne", ogLocale: "ne_NP", hreflang: "ne" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Public URL path for a locale. English lives at the root, Nepali under /ne. */
export function localePath(lang: Locale, path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLocale) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export type EntryType = "article" | "disease" | "drug";

/** Section base path per entry type. */
export const sectionPath: Record<EntryType, string> = {
  article: "/articles",
  disease: "/diseases",
  drug: "/drugs",
};

export function entryPath(lang: Locale, type: EntryType, slug: string) {
  return localePath(lang, `${sectionPath[type]}/${slug}`);
}
