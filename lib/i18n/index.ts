import type { Locale } from "@/lib/site";
import en, { type Dictionary } from "./en";
import ne from "./ne";

const dictionaries: Record<Locale, Dictionary> = { en, ne };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

export type { Dictionary };

const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function localizeDigits(value: string | number, lang: Locale) {
  const s = String(value);
  return lang === "ne" ? s.replace(/\d/g, (d) => nepaliDigits[Number(d)]) : s;
}

export function formatDate(date: string | Date | null | undefined, lang: Locale) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "ne" ? "ne-NP" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kathmandu" }).format(d);
}
