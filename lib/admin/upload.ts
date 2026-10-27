"use client";

import { browserClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { slugify } from "@/lib/slug";

const MAX_EDGE = 2000;

/** Resizes large photos and re-encodes them as WebP in the browser before upload. */
async function optimise(file: File): Promise<{ blob: Blob; width: number; height: number; mime: string; ext: string }> {
  const passthrough = ["image/svg+xml", "image/gif"].includes(file.type);
  const bitmap = passthrough ? null : await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    const dims = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
    return { blob: file, ...dims, mime: file.type, ext: file.name.split(".").pop() || "img" };
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image"))), "image/webp", 0.82));
  return { blob, width, height, mime: "image/webp", ext: "webp" };
}

export async function uploadImage(file: File, nameHint: string) {
  const { blob, width, height, mime, ext } = await optimise(file);
  const now = new Date();
  const base = slugify(nameHint || file.name.replace(/\.[^.]+$/, "")) || "image";
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${base}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const sb = browserClient();
  const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: mime, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl, width, height, mime, size_bytes: blob.size };
}
