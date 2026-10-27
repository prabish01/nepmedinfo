"use client";

import { CheckIcon, CloudArrowUpIcon, MagnifyingGlassIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { createMedia, listMedia, updateMedia } from "@/app/admin/actions";
import { uploadImage } from "@/lib/admin/upload";
import type { Locale } from "@/lib/site";
import type { MediaItem } from "@/lib/types";
import { Button, Field, Input, Textarea } from "./ui";

export type PickedImage = { url: string; width: number | null; height: number | null; alt: string; credit: string | null };

/**
 * Library + upload dialog. Alt text is required: an image cannot be inserted
 * until it has alt text in the language being edited.
 */
export default function MediaPicker({ open, onClose, onPick, lang }: { open: boolean; onClose: () => void; onPick: (img: PickedImage) => void; lang: Locale }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [credit, setCredit] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setLoading(true);
      listMedia()
        .then((m) => setItems(m as MediaItem[]))
        .catch((e) => setError(String(e.message ?? e)))
        .finally(() => setLoading(false));
    } else if (!open && d.open) d.close();
  }, [open]);

  const reset = () => {
    setSelected(null);
    setFile(null);
    setPreview(null);
    setAlt("");
    setCredit("");
    setError(null);
  };

  const choose = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Choose an image file.");
    if (f.size > 10 * 1024 * 1024) return setError("Images must be under 10 MB.");
    setSelected(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const confirm = async () => {
    if (!alt.trim()) return setError("Describe the image for people using screen readers and for search engines.");
    setBusy(true);
    setError(null);
    try {
      if (file) {
        const up = await uploadImage(file, alt.slice(0, 60));
        const m = (await createMedia({ ...up, alt: { [lang]: alt.trim() }, credit })) as MediaItem;
        onPick({ url: m.url, width: m.width, height: m.height, alt: alt.trim(), credit: m.credit });
      } else if (selected) {
        if (selected.alt[lang] !== alt.trim() || (selected.credit ?? "") !== credit) {
          await updateMedia(selected.id, { alt: { ...selected.alt, [lang]: alt.trim() }, credit: credit || null });
        }
        onPick({ url: selected.url, width: selected.width, height: selected.height, alt: alt.trim(), credit: credit || null });
      }
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const filtered = items.filter((m) => !q || `${m.alt.en ?? ""} ${m.alt.ne ?? ""} ${m.path}`.toLowerCase().includes(q.toLowerCase()));
  const current = preview ?? selected?.url ?? null;

  return (
    <dialog
      ref={dialog}
      onClose={() => {
        reset();
        onClose();
      }}
      className="m-auto w-[min(1100px,calc(100vw-24px))] rounded-3xl p-0 shadow-2xl backdrop:bg-navy/50"
    >
      <div className="flex max-h-[88dvh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Choose an image</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ground" aria-label="Close">
            <XIcon size={18} />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-h-0 overflow-y-auto p-6">
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-6 py-8 text-center transition hover:border-blue-500"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                choose(e.dataTransfer.files[0]);
              }}
            >
              <CloudArrowUpIcon size={30} className="text-blue-700" />
              <span className="font-semibold text-ink">Drop an image or click to upload</span>
              <span className="text-[0.82rem] text-muted">JPG, PNG, WebP or AVIF up to 10 MB. Large photos are resized to 2000px and converted to WebP.</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => choose(e.target.files?.[0])} />
            </label>

            <div className="relative mt-6">
              <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by alt text or file name" className="w-full rounded-xl border border-line py-2 pl-9 pr-3 text-[0.9rem] outline-none focus:border-blue-500" />
            </div>
            {loading ? (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-xl bg-ground" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="mt-8 text-center text-muted">No images yet. Upload one above.</p>
            ) : (
              <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {filtered.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                        setSelected(m);
                        setAlt(m.alt[lang] ?? "");
                        setCredit(m.credit ?? "");
                      }}
                      className={`relative block aspect-square w-full overflow-hidden rounded-xl ring-2 transition ${selected?.id === m.id ? "ring-blue-600" : "ring-transparent hover:ring-blue-200"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.alt[lang] || m.alt.en || ""} className="h-full w-full object-cover" loading="lazy" />
                      {!m.alt[lang] && (
                        <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-warn-soft px-1.5 py-0.5 text-[0.65rem] font-bold text-warn">
                          <WarningIcon size={11} weight="bold" /> alt
                        </span>
                      )}
                      {selected?.id === m.id && (
                        <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-blue-700 text-white">
                          <CheckIcon size={14} weight="bold" />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-line bg-ground/50 p-6 md:border-l md:border-t-0">
            {current ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
                <Field
                  label={`Alt text (${lang === "ne" ? "Nepali" : "English"})`}
                  htmlFor="mp-alt"
                  counter={<span className="text-[0.78rem] text-muted">{alt.length} / 125</span>}
                  hint="Describe what the image shows and why it matters here. Do not start with “Image of”."
                >
                  <Textarea id="mp-alt" value={alt} onChange={(e) => setAlt(e.target.value)} lang={lang} rows={3} />
                </Field>
                <Field label="Credit" htmlFor="mp-credit" hint="Photographer, licence or source, shown under cover images.">
                  <Input id="mp-credit" value={credit} onChange={(e) => setCredit(e.target.value)} />
                </Field>
                {error && <p className="rounded-xl bg-red-50 p-3 text-[0.85rem] text-red-700">{error}</p>}
                <Button onClick={confirm} disabled={busy} className="w-full">
                  {busy ? (file ? "Uploading..." : "Saving...") : file ? "Upload and use" : "Use this image"}
                </Button>
              </div>
            ) : (
              <p className="text-[0.9rem] text-muted">Select an image from the library or upload a new one.</p>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
