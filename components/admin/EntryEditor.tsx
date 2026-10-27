"use client";

import { ArrowLeftIcon, ArrowSquareOutIcon, CopyIcon, ImageIcon, LockSimpleIcon, LockSimpleOpenIcon, TrashIcon, WarningIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { deleteEntry, saveEntry } from "@/app/admin/actions";
import { type EntryDraft, type TranslationDraft, emptyTranslation } from "@/lib/admin/types";
import { analyse } from "@/lib/admin/seo-check";
import { type EntryType, type Locale, entryPath, localeMeta, locales } from "@/lib/site";
import { slugify } from "@/lib/slug";
import type { Author, Category, EntryStatus } from "@/lib/types";
import { FaqList, SourceList, StringList, TagInput } from "./ListEditors";
import MediaPicker from "./MediaPicker";
import RichEditor from "./RichEditor";
import SeoPanel from "./SeoPanel";
import { Button, Counter, Field, Input, Panel, Select, Textarea, Toggle } from "./ui";

const typeLabel: Record<EntryType, string> = { article: "Article", disease: "Disease", drug: "Drug or supplement" };

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function EntryEditor({ initial, authors, categories }: { initial: EntryDraft; authors: Author[]; categories: Category[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<EntryDraft>(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [lang, setLang] = useState<Locale>("en");
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [coverPicker, setCoverPicker] = useState(false);
  const [slugLocked, setSlugLocked] = useState<Record<Locale, boolean>>(() => ({
    en: !!initial.translations.en?.slug,
    ne: !!initial.translations.ne?.slug,
  }));

  const dirty = JSON.stringify(draft) !== saved;
  const t = draft.translations[lang] ?? emptyTranslation(lang);
  const exists = !!draft.translations[lang];

  const patchEntry = (p: Partial<EntryDraft>) => setDraft((d) => ({ ...d, ...p }));
  const patchT = useCallback(
    (p: Partial<TranslationDraft>) =>
      setDraft((d) => {
        const cur = d.translations[lang] ?? emptyTranslation(lang);
        const next = { ...cur, ...p };
        if ("title" in p && !slugLocked[lang]) {
          const fromTitle = slugify(p.title ?? "");
          next.slug = fromTitle || d.translations.en?.slug || cur.slug;
        }
        return { ...d, translations: { ...d.translations, [lang]: next } };
      }),
    [lang, slugLocked],
  );

  const save = useCallback(
    (status?: EntryStatus) => {
      const payload = { ...draft, status: status ?? draft.status };
      setError(null);
      start(async () => {
        const res = await saveEntry(payload);
        if (!res.ok) {
          if (res.lang) setLang(res.lang);
          setError({ text: res.error, field: res.field });
          return;
        }
        const next = { ...payload, id: res.id, status: res.status, published_at: res.published_at };
        setDraft(next);
        setSaved(JSON.stringify(next));
        setSavedAt(res.savedAt);
        if (!draft.id) router.replace(`/admin/entries/${res.id}`);
        else router.refresh();
      });
    },
    [draft, router],
  );

  // Cmd/Ctrl + S saves; warn before leaving with unsaved changes.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    const leave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", key);
    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("beforeunload", leave);
    };
  }, [dirty]);

  const langStatus = useMemo(
    () =>
      Object.fromEntries(
        locales.map((l) => {
          const tr = draft.translations[l];
          if (!tr || !tr.title.trim()) return [l, { tone: "bg-line", label: "Not written" }];
          if (!tr.is_ready) return [l, { tone: "bg-amber-400", label: "Hidden" }];
          const { score } = analyse(tr, { hasCover: !!draft.cover_url, isEnglish: l === "en" });
          return [l, { tone: score >= 80 ? "bg-green-600" : "bg-amber-400", label: `SEO ${score}` }];
        }),
      ) as Record<Locale, { tone: string; label: string }>,
    [draft],
  );

  const copyFromEnglish = () => {
    const en = draft.translations.en;
    if (!en) return;
    setDraft((d) => ({ ...d, translations: { ...d.translations, ne: { ...en, id: d.translations.ne?.id, locale: "ne", slug: en.slug, focus_keyword: "" } } }));
  };

  const liveUrl = draft.id && draft.status === "published" && t.slug && exists ? entryPath(lang, draft.type, t.slug) : null;
  const reviewers = authors.filter((a) => a.is_reviewer);
  const err = (field: string) => (error?.field === field ? error.text : null);

  return (
    <div className="pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="flex h-[60px] items-center gap-3 px-4 md:px-8">
          <Link href="/admin" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-ground" aria-label="Back to content">
            <ArrowLeftIcon size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.95rem] font-semibold text-ink">{draft.translations.en?.title || draft.translations.ne?.title || `New ${typeLabel[draft.type].toLowerCase()}`}</p>
            <p className="text-[0.78rem] text-muted">
              {typeLabel[draft.type]} · <span className="capitalize">{draft.status}</span> ·{" "}
              {pending ? "Saving..." : dirty ? <span className="text-warn">Unsaved changes</span> : savedAt ? "All changes saved" : draft.id ? "Saved" : "Not saved yet"}
            </p>
          </div>
          {liveUrl && (
            <a href={liveUrl} target="_blank" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[0.85rem] font-semibold text-ink/75 hover:bg-ground sm:inline-flex">
              <ArrowSquareOutIcon size={16} /> View
            </a>
          )}
          <Button variant="secondary" onClick={() => save(draft.status === "published" ? "draft" : undefined)} disabled={pending}>
            {draft.status === "published" ? "Unpublish" : "Save draft"}
          </Button>
          <Button onClick={() => save("published")} disabled={pending}>
            {draft.status === "published" ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-[0.9rem] text-red-800 md:mx-8" role="alert">
          <WarningIcon size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error.text}
        </div>
      )}

      <div className="grid gap-6 px-4 pt-6 md:px-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="Language" className="inline-flex rounded-full bg-white p-1 ring-1 ring-line">
              {locales.map((l) => (
                <button
                  key={l}
                  role="tab"
                  type="button"
                  aria-selected={lang === l}
                  onClick={() => setLang(l)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-[0.88rem] font-semibold transition ${lang === l ? "bg-blue-700 text-white" : "text-ink/70 hover:text-ink"}`}
                >
                  <span className={`h-2 w-2 rounded-full ${langStatus[l].tone}`} aria-hidden />
                  {localeMeta[l].label}
                  <span className={`text-[0.72rem] font-medium ${lang === l ? "text-white/75" : "text-muted"}`}>{langStatus[l].label}</span>
                </button>
              ))}
            </div>
            {lang === "ne" && !draft.translations.ne?.title && draft.translations.en?.title && (
              <Button variant="secondary" size="sm" onClick={copyFromEnglish}>
                <CopyIcon size={15} /> Copy English as a starting point
              </Button>
            )}
          </div>

          {lang !== "en" && (
            <p className="rounded-xl bg-blue-50 px-4 py-3 text-[0.85rem] text-blue-900">
              Write this version in Nepali. Leave the title empty to keep this page English-only; readers who switch language will be sent to the Nepali section page instead.
            </p>
          )}

          <div className="space-y-5 rounded-2xl bg-white p-5 ring-1 ring-line md:p-6">
            <Field label="Title (H1)" htmlFor={`title-${lang}`} error={err("title")} counter={<Counter value={t.title.length} min={10} max={70} />}>
              <Input id={`title-${lang}`} lang={lang} value={t.title} onChange={(e) => patchT({ title: e.target.value })} className="!py-3 !text-xl font-semibold" placeholder={lang === "ne" ? "शीर्षक" : "Dengue"} />
            </Field>

            <Field label="URL slug" htmlFor={`slug-${lang}`} error={err("slug")} hint={<span className="break-all">nepalmedinfo.com{entryPath(lang, draft.type, t.slug || "...")}</span>}>
              <div className="flex gap-2">
                <Input
                  id={`slug-${lang}`}
                  value={t.slug}
                  onChange={(e) => {
                    setSlugLocked((s) => ({ ...s, [lang]: true }));
                    patchT({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") });
                  }}
                  className="font-mono !text-[0.88rem]"
                />
                <button
                  type="button"
                  onClick={() => setSlugLocked((s) => ({ ...s, [lang]: !s[lang] }))}
                  className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl ring-1 ring-line hover:bg-ground"
                  title={slugLocked[lang] ? "Slug is locked. Click to follow the title again." : "Slug follows the title. Click to lock."}
                  aria-label="Toggle slug lock"
                >
                  {slugLocked[lang] ? <LockSimpleIcon size={17} /> : <LockSimpleOpenIcon size={17} />}
                </button>
              </div>
            </Field>

            <Field label="Summary" htmlFor={`excerpt-${lang}`} counter={<Counter value={t.excerpt.length} min={60} max={220} />} hint="One or two sentences shown under the title, in listings and as the fallback meta description.">
              <Textarea id={`excerpt-${lang}`} lang={lang} rows={3} value={t.excerpt} onChange={(e) => patchT({ excerpt: e.target.value })} />
            </Field>

            {draft.type !== "article" && (
              <Field label="Also known as" htmlFor={`aka-${lang}`} hint="Other names people search for. Press Enter after each one.">
                <TagInput id={`aka-${lang}`} lang={lang} value={t.also_known_as} onChange={(v) => patchT({ also_known_as: v })} placeholder={lang === "ne" ? "डेंगी" : "Dengue fever, breakbone fever"} />
              </Field>
            )}
          </div>

          <RichEditor key={lang} value={t.body_html} onChange={(html) => patchT({ body_html: html })} lang={lang} placeholder={lang === "ne" ? "यहाँ लेख्न सुरु गर्नुहोस्..." : "Start writing. Use H2 headings for each main section."} />

          <Panel title="Key points">
            <p className="-mt-2 text-[0.82rem] text-muted">Three to five short takeaways shown at the top of the page.</p>
            <StringList lang={lang} value={t.key_points} onChange={(v) => patchT({ key_points: v })} placeholder="One clear, short sentence" addLabel="Add key point" />
          </Panel>

          <Panel title="Frequently asked questions">
            <p className="-mt-2 text-[0.82rem] text-muted">Shown as an accordion and added to the page as FAQ structured data.</p>
            <FaqList lang={lang} value={t.faqs} onChange={(v) => patchT({ faqs: v })} />
          </Panel>

          <Panel title="Sources">
            <p className="-mt-2 text-[0.82rem] text-muted">Guidelines and research this page is based on. Listed at the end and cited in structured data.</p>
            <SourceList value={t.sources} onChange={(v) => patchT({ sources: v })} />
          </Panel>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Panel title="Publishing">
            <Field label="Status" htmlFor="status">
              <Select id="status" value={draft.status} onChange={(e) => patchEntry({ status: e.target.value as EntryStatus })}>
                <option value="draft">Draft</option>
                <option value="review">Ready for medical review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
            <Field label="Publish date" htmlFor="published_at" hint="Set a future date to schedule. Leave empty to use the moment you publish.">
              <Input
                id="published_at"
                type="datetime-local"
                value={toLocalInput(draft.published_at)}
                onChange={(e) => patchEntry({ published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </Field>
            <Toggle id={`ready-${lang}`} checked={t.is_ready} onChange={(v) => patchT({ is_ready: v })} label={`Show ${localeMeta[lang].label} version`} hint="Turn off to keep this language hidden while it is being written." />
            <Toggle id="featured" checked={draft.featured} onChange={(v) => patchEntry({ featured: v })} label="Feature on the homepage" hint="Listed under “People are reading”." />
          </Panel>

          <Panel title="Details">
            <Field label="Content type" htmlFor="type">
              <Select id="type" value={draft.type} onChange={(e) => patchEntry({ type: e.target.value as EntryType })}>
                <option value="article">Article</option>
                <option value="disease">Disease or condition</option>
                <option value="drug">Drug or supplement</option>
              </Select>
            </Field>
            {draft.type === "article" && (
              <Field label="Category" htmlFor="category">
                <Select id="category" value={draft.category_id ?? ""} onChange={(e) => patchEntry({ category_id: e.target.value || null })}>
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.en}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <Field label="Author" htmlFor="author">
              <Select id="author" value={draft.author_id ?? ""} onChange={(e) => patchEntry({ author_id: e.target.value || null })}>
                <option value="">None</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name.en}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Medical reviewer"
              htmlFor="reviewer"
              hint={reviewers.length ? "Shown with a review badge and in structured data." : <Link href="/admin/authors" className="text-blue-700 hover:underline">Add a reviewer first</Link>}
            >
              <Select id="reviewer" value={draft.reviewer_id ?? ""} onChange={(e) => patchEntry({ reviewer_id: e.target.value || null })}>
                <option value="">Not reviewed yet</option>
                {reviewers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name.en}
                    {a.credentials ? `, ${a.credentials}` : ""}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Last medically reviewed" htmlFor="reviewed_at">
              <Input id="reviewed_at" type="date" value={draft.reviewed_at ?? ""} onChange={(e) => patchEntry({ reviewed_at: e.target.value || null })} />
            </Field>
          </Panel>

          <Panel title="Cover image">
            {draft.cover_url ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.cover_url} alt={t.cover_alt ?? ""} className="aspect-[16/9] w-full rounded-xl object-cover" />
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setCoverPicker(true)}>
                    Replace
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => patchEntry({ cover_url: null, cover_width: null, cover_height: null, cover_credit: null })}>
                    Remove
                  </Button>
                </div>
                <Field
                  label={`Alt text (${localeMeta[lang].label})`}
                  htmlFor={`cover-alt-${lang}`}
                  error={err("cover_alt")}
                  counter={<span className="text-[0.78rem] text-muted">{(t.cover_alt ?? "").length} / 125</span>}
                >
                  <Textarea id={`cover-alt-${lang}`} lang={lang} rows={2} value={t.cover_alt ?? ""} onChange={(e) => patchT({ cover_alt: e.target.value })} />
                </Field>
                <Field label="Credit" htmlFor="cover-credit">
                  <Input id="cover-credit" value={draft.cover_credit ?? ""} onChange={(e) => patchEntry({ cover_credit: e.target.value })} />
                </Field>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCoverPicker(true)}
                className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-muted transition hover:border-blue-300 hover:text-blue-700"
              >
                <ImageIcon size={26} />
                <span className="text-[0.88rem] font-semibold">Choose cover image</span>
              </button>
            )}
            <MediaPicker
              open={coverPicker}
              lang={lang}
              onClose={() => setCoverPicker(false)}
              onPick={(img) => {
                patchEntry({ cover_url: img.url, cover_width: img.width, cover_height: img.height, cover_credit: img.credit });
                patchT({ cover_alt: img.alt });
              }}
            />
          </Panel>

          <SeoPanel t={t} lang={lang} type={draft.type} coverUrl={draft.cover_url} onChange={patchT} />

          {draft.id && (
            <Panel title="Danger zone">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (confirm("Delete this page in every language? This cannot be undone.")) start(() => deleteEntry(draft.id!));
                }}
              >
                <TrashIcon size={15} /> Delete page
              </Button>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
