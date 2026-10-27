import { parse } from "node-html-parser";
import sanitizeHtml from "sanitize-html";

export type TocItem = { id: string; text: string; level: 2 | 3 };

const allowedTags = [
  "h2", "h3", "h4", "p", "br", "hr", "a", "strong", "b", "em", "i", "u", "s", "sup", "sub", "code", "pre",
  "ul", "ol", "li", "blockquote", "figure", "figcaption", "img",
  "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col",
];

/** Sanitise editor HTML. H1 is reserved for the page title, so it is demoted to H2. */
export function sanitizeBody(html: string) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
      col: ["span"],
      "*": ["id"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      h1: "h2",
      b: "strong",
      i: "em",
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//.test(href) && !/^https?:\/\/(www\.)?nepalmedinfo\.com/.test(href);
        return {
          tagName,
          attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : { ...attribs, target: "", rel: "" },
        };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren?.length,
  }).replace(/ (target|rel)=""/g, "");
}

function headingId(text: string, used: Set<string>) {
  const base =
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section";
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

/** Adds ids to H2/H3 for the table of contents and lazy-loads inline images. */
export function prepareBody(html: string): { html: string; toc: TocItem[] } {
  const root = parse(sanitizeBody(html));
  const used = new Set<string>();
  const toc: TocItem[] = [];
  root.querySelectorAll("h2, h3").forEach((h) => {
    const text = h.textContent.trim();
    if (!text) return;
    const id = h.getAttribute("id") || headingId(text, used);
    h.setAttribute("id", id);
    toc.push({ id, text, level: h.tagName === "H2" ? 2 : 3 });
  });
  root.querySelectorAll("img").forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    if (!img.getAttribute("alt")) img.setAttribute("alt", "");
  });
  return { html: root.toString(), toc };
}

export function plainText(html: string) {
  // Tags become spaces so adjacent blocks ("</p><h2>") do not glue words together.
  return parse(html.replace(/<[^>]+>/g, " ")).textContent.replace(/\s+/g, " ").trim();
}

export function countWords(html: string) {
  const text = plainText(html);
  return text ? text.split(" ").length : 0;
}

export function readingMinutes(words: number) {
  return Math.max(1, Math.round(words / 200));
}
