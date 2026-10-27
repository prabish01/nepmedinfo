"use client";

import { CopyIcon, PlusIcon, TrashIcon, WarningIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMedia, updateMedia } from "@/app/admin/actions";
import type { MediaItem } from "@/lib/types";
import MediaPicker from "./MediaPicker";
import { Button, Field, Input, Textarea } from "./ui";

export default function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [active, setActive] = useState<MediaItem | null>(null);
  const [upload, setUpload] = useState(false);
  const [filter, setFilter] = useState<"all" | "missing">("all");
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ en: "", ne: "", credit: "" });
  const missing = items.filter((m) => !m.alt.en || !m.alt.ne).length;
  const list = filter === "missing" ? items.filter((m) => !m.alt.en || !m.alt.ne) : items;

  const open = (m: MediaItem) => {
    setActive(m);
    setForm({ en: m.alt.en ?? "", ne: m.alt.ne ?? "", credit: m.credit ?? "" });
  };

  return (
    <div className="px-4 py-8 md:px-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Media library</h1>
          <p className="mt-1 text-muted">
            {items.length} images. {missing > 0 ? `${missing} need alt text in at least one language.` : "Every image has alt text in both languages."}
          </p>
        </div>
        <Button onClick={() => setUpload(true)}>
          <PlusIcon size={16} weight="bold" /> Upload image
        </Button>
      </div>

      <div className="mt-6 inline-flex rounded-full bg-ground-strong/60 p-1">
        {(["all", "missing"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-[0.85rem] font-semibold ${filter === f ? "bg-white text-ink shadow-sm" : "text-muted"}`}>
            {f === "all" ? "All images" : `Missing alt (${missing})`}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {list.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-line">
            <p className="font-semibold text-ink">No images here.</p>
            <p className="mt-1 text-muted">Upload photos to use as covers and inside articles.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {list.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => open(m)} className={`group w-full overflow-hidden rounded-2xl bg-white text-left ring-2 transition ${active?.id === m.id ? "ring-blue-600" : "ring-line hover:ring-blue-200"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt.en || ""} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <span className="block px-3 py-2">
                    <span className="line-clamp-1 text-[0.8rem] text-ink">{m.alt.en || m.alt.ne || "No alt text"}</span>
                    <span className="mt-1 flex gap-1">
                      {(["en", "ne"] as const).map((l) => (
                        <span key={l} className={`rounded px-1.5 py-px text-[0.66rem] font-bold uppercase ${m.alt[l] ? "bg-blue-50 text-blue-800" : "bg-warn-soft text-warn"}`}>
                          {l}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <aside className="lg:sticky lg:top-6 lg:self-start">
          {active ? (
            <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.url} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
              <p className="text-[0.8rem] text-muted">
                {active.width} x {active.height}px · {active.size_bytes ? `${Math.round(active.size_bytes / 1024)} KB` : ""} · {active.mime}
              </p>
              <Field label="Alt text (English)" htmlFor="alt-en">
                <Textarea id="alt-en" rows={2} value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} />
              </Field>
              <Field label="Alt text (नेपाली)" htmlFor="alt-ne">
                <Textarea id="alt-ne" lang="ne" rows={2} value={form.ne} onChange={(e) => setForm({ ...form, ne: e.target.value })} />
              </Field>
              <Field label="Credit" htmlFor="credit">
                <Input id="credit" value={form.credit} onChange={(e) => setForm({ ...form, credit: e.target.value })} />
              </Field>
              {(!form.en || !form.ne) && (
                <p className="flex gap-2 rounded-xl bg-warn-soft p-3 text-[0.82rem] text-warn">
                  <WarningIcon size={16} weight="fill" className="mt-0.5 shrink-0" /> Add alt text in both languages so the image is accessible on every version of the site.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const m = (await updateMedia(active.id, { alt: { en: form.en.trim(), ne: form.ne.trim() }, credit: form.credit.trim() || null })) as MediaItem;
                      setActive(m);
                      router.refresh();
                    })
                  }
                >
                  {pending ? "Saving..." : "Save"}
                </Button>
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(active.url)}>
                  <CopyIcon size={15} /> Copy URL
                </Button>
                <Button
                  variant="danger"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Delete this image? Pages that use it will show a broken image.")) return;
                    start(async () => {
                      await deleteMedia(active.id);
                      setActive(null);
                      router.refresh();
                    });
                  }}
                >
                  <TrashIcon size={15} />
                </Button>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl bg-white p-5 text-[0.9rem] text-muted ring-1 ring-line">Select an image to edit its alt text and credit.</p>
          )}
        </aside>
      </div>
      <MediaPicker open={upload} lang="en" onClose={() => setUpload(false)} onPick={() => router.refresh()} />
    </div>
  );
}
