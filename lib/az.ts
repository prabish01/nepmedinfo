import type { Locale } from "@/lib/site";

const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// Nepali alphabet order for grouping titles by their first letter.
const DEVANAGARI = "अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहक्षत्रज्ञ".match(/क्ष|त्र|ज्ञ|./gu)!;

export function letterOf(title: string) {
  const t = title.trim();
  const conjunct = t.match(/^(क्ष|त्र|ज्ञ)/);
  if (conjunct) return conjunct[1];
  const ch = t.charAt(0);
  if (/[a-z]/i.test(ch)) return ch.toUpperCase();
  if (/[ऀ-ॿ]/.test(ch)) return ch;
  return "#";
}

/** Letters shown in the A-Z bar for a language, in alphabet order. */
export function alphabet(lang: Locale) {
  return lang === "ne" ? [...DEVANAGARI, ...LATIN] : LATIN;
}

export function groupByLetter<T extends { title: string }>(items: T[], lang: Locale) {
  const order = alphabet(lang);
  const groups = new Map<string, T[]>();
  for (const it of items) {
    const l = letterOf(it.title);
    groups.set(l, [...(groups.get(l) ?? []), it]);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
}

export function letterId(letter: string) {
  return `letter-${encodeURIComponent(letter)}`;
}
