"use client";

import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import type { Category } from "@/lib/types";
import { Button, Field, Input, Panel, Textarea } from "./ui";

type Form = { id?: string; slug: string; name: { en?: string; ne?: string }; description: { en?: string; ne?: string }; sort: number };

export default function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (p: Partial<Form>) => setForm((f) => (f ? { ...f, ...p } : f));

  return (
    <div className="px-4 py-8 md:px-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Categories</h1>
          <p className="mt-1 text-muted">Group articles into topics. Each category gets its own page in both languages.</p>
        </div>
        <Button onClick={() => setForm({ slug: "", name: {}, description: {}, sort: categories.length + 1 })}>
          <PlusIcon size={16} weight="bold" /> Add category
        </Button>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">
                  {c.name.en} <span className="font-normal text-muted" lang="ne">· {c.name.ne}</span>
                </p>
                <p className="truncate text-[0.85rem] text-muted">/articles/category/{c.slug}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...c })}>
                <PencilSimpleIcon size={15} /> Edit
              </Button>
            </li>
          ))}
          {categories.length === 0 && <li className="p-10 text-center text-muted">No categories yet.</li>}
        </ul>
        {form && (
          <Panel title={form.id ? "Edit category" : "New category"} className="lg:sticky lg:top-6 lg:self-start">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name (English)" htmlFor="c-en">
                <Input id="c-en" value={form.name.en ?? ""} onChange={(e) => set({ name: { ...form.name, en: e.target.value }, ...(form.id ? {} : { slug: slugify(e.target.value) }) })} />
              </Field>
              <Field label="Name (नेपाली)" htmlFor="c-ne">
                <Input id="c-ne" lang="ne" value={form.name.ne ?? ""} onChange={(e) => set({ name: { ...form.name, ne: e.target.value } })} />
              </Field>
            </div>
            <Field label="URL slug" htmlFor="c-slug">
              <Input id="c-slug" value={form.slug} onChange={(e) => set({ slug: e.target.value.toLowerCase() })} className="font-mono !text-[0.88rem]" />
            </Field>
            <Field label="Description (English)" htmlFor="c-den" hint="Used as the meta description of the category page.">
              <Textarea id="c-den" rows={2} value={form.description.en ?? ""} onChange={(e) => set({ description: { ...form.description, en: e.target.value } })} />
            </Field>
            <Field label="Description (नेपाली)" htmlFor="c-dne">
              <Textarea id="c-dne" lang="ne" rows={2} value={form.description.ne ?? ""} onChange={(e) => set({ description: { ...form.description, ne: e.target.value } })} />
            </Field>
            <Field label="Order" htmlFor="c-sort">
              <Input id="c-sort" type="number" value={form.sort} onChange={(e) => set({ sort: Number(e.target.value) })} />
            </Field>
            {error && <p className="rounded-xl bg-red-50 p-3 text-[0.85rem] text-red-700">{error}</p>}
            <div className="flex gap-2">
              <Button
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    setError(null);
                    const res = await saveCategory(form);
                    if (!res.ok) return setError(res.error);
                    setForm(null);
                    router.refresh();
                  })
                }
              >
                {pending ? "Saving..." : "Save"}
              </Button>
              <Button variant="ghost" onClick={() => setForm(null)}>
                Cancel
              </Button>
              {form.id && (
                <Button
                  variant="danger"
                  className="ml-auto"
                  onClick={() => {
                    if (!confirm("Delete this category? Articles in it will become uncategorised.")) return;
                    start(async () => {
                      await deleteCategory(form.id!);
                      setForm(null);
                      router.refresh();
                    });
                  }}
                >
                  <TrashIcon size={15} />
                </Button>
              )}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
