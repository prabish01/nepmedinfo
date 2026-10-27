"use client";

import { PencilSimpleIcon, PlusIcon, SealCheckIcon, TrashIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAuthor, saveAuthor } from "@/app/admin/actions";
import LogoMark from "@/components/brand/LogoMark";
import { slugify } from "@/lib/slug";
import type { Author } from "@/lib/types";
import MediaPicker from "./MediaPicker";
import { Button, Field, Input, Panel, Textarea, Toggle } from "./ui";

const blank: Omit<Author, "id"> & { id?: string } = {
  slug: "",
  name: { en: "", ne: "" },
  credentials: "",
  job_title: { en: "", ne: "" },
  bio: { en: "", ne: "" },
  avatar_url: null,
  avatar_alt: { en: "", ne: "" },
  nmc_number: "",
  same_as: [],
  is_reviewer: false,
};

export default function AuthorsManager({ authors }: { authors: Author[] }) {
  const router = useRouter();
  const [form, setForm] = useState<typeof blank | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [pending, start] = useTransition();

  const set = (p: Partial<typeof blank>) => setForm((f) => (f ? { ...f, ...p } : f));

  return (
    <div className="px-4 py-8 md:px-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Authors and reviewers</h1>
          <p className="mt-1 max-w-2xl text-muted">Real names, credentials and registration numbers build trust with readers and search engines. Reviewers appear with a badge on the pages they check.</p>
        </div>
        <Button onClick={() => setForm({ ...blank })}>
          <PlusIcon size={16} weight="bold" /> Add person
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
        <ul className="space-y-3">
          {authors.map((a) => (
            <li key={a.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-line">
              {a.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <LogoMark size={48} />
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold text-ink">
                  {a.name.en}
                  {a.is_reviewer && <SealCheckIcon size={17} weight="fill" className="text-green-600" aria-label="Medical reviewer" />}
                </p>
                <p className="truncate text-[0.85rem] text-muted">{[a.credentials, a.job_title.en].filter(Boolean).join(" · ") || a.slug}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...a, credentials: a.credentials ?? "", nmc_number: a.nmc_number ?? "" })}>
                <PencilSimpleIcon size={15} /> Edit
              </Button>
            </li>
          ))}
          {authors.length === 0 && <li className="rounded-2xl bg-white p-10 text-center text-muted ring-1 ring-line">No authors yet.</li>}
        </ul>

        {form && (
          <Panel title={form.id ? "Edit person" : "New person"} className="lg:sticky lg:top-6 lg:self-start">
            <div className="flex items-center gap-3">
              {form.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <LogoMark size={64} />
              )}
              <Button variant="secondary" size="sm" onClick={() => setPicker(true)}>
                {form.avatar_url ? "Change photo" : "Add photo"}
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name (English)" htmlFor="a-name-en">
                <Input id="a-name-en" value={form.name.en ?? ""} onChange={(e) => set({ name: { ...form.name, en: e.target.value }, ...(form.id ? {} : { slug: slugify(e.target.value) }) })} />
              </Field>
              <Field label="Name (नेपाली)" htmlFor="a-name-ne">
                <Input id="a-name-ne" lang="ne" value={form.name.ne ?? ""} onChange={(e) => set({ name: { ...form.name, ne: e.target.value } })} />
              </Field>
            </div>
            <Field label="Profile URL slug" htmlFor="a-slug" hint={`nepalmedinfo.com/authors/${form.slug || "..."}`}>
              <Input id="a-slug" value={form.slug} onChange={(e) => set({ slug: e.target.value.toLowerCase() })} className="font-mono !text-[0.88rem]" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Credentials" htmlFor="a-cred" hint="e.g. MBBS, MD">
                <Input id="a-cred" value={form.credentials ?? ""} onChange={(e) => set({ credentials: e.target.value })} />
              </Field>
              <Field label="NMC registration no." htmlFor="a-nmc">
                <Input id="a-nmc" value={form.nmc_number ?? ""} onChange={(e) => set({ nmc_number: e.target.value })} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Role (English)" htmlFor="a-job-en">
                <Input id="a-job-en" value={form.job_title.en ?? ""} onChange={(e) => set({ job_title: { ...form.job_title, en: e.target.value } })} placeholder="Consultant physician" />
              </Field>
              <Field label="Role (नेपाली)" htmlFor="a-job-ne">
                <Input id="a-job-ne" lang="ne" value={form.job_title.ne ?? ""} onChange={(e) => set({ job_title: { ...form.job_title, ne: e.target.value } })} />
              </Field>
            </div>
            <Field label="Bio (English)" htmlFor="a-bio-en">
              <Textarea id="a-bio-en" rows={3} value={form.bio.en ?? ""} onChange={(e) => set({ bio: { ...form.bio, en: e.target.value } })} />
            </Field>
            <Field label="Bio (नेपाली)" htmlFor="a-bio-ne">
              <Textarea id="a-bio-ne" lang="ne" rows={3} value={form.bio.ne ?? ""} onChange={(e) => set({ bio: { ...form.bio, ne: e.target.value } })} />
            </Field>
            <Field label="Profile links" htmlFor="a-same" hint="One per line: hospital profile, LinkedIn, ORCID. Used as sameAs in structured data.">
              <Textarea id="a-same" rows={3} value={form.same_as.join("\n")} onChange={(e) => set({ same_as: e.target.value.split("\n") })} />
            </Field>
            <Toggle id="a-reviewer" checked={form.is_reviewer} onChange={(v) => set({ is_reviewer: v })} label="Medical reviewer" hint="Can be selected as the reviewer on disease, drug and article pages." />
            {error && <p className="rounded-xl bg-red-50 p-3 text-[0.85rem] text-red-700">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    setError(null);
                    const res = await saveAuthor({ ...form, same_as: form.same_as.map((s) => s.trim()).filter(Boolean) } as Parameters<typeof saveAuthor>[0]);
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
                    if (!confirm("Delete this person? Their pages will keep their content but lose the byline.")) return;
                    start(async () => {
                      await deleteAuthor(form.id!);
                      setForm(null);
                      router.refresh();
                    });
                  }}
                >
                  <TrashIcon size={15} />
                </Button>
              )}
            </div>
            <MediaPicker
              open={picker}
              lang="en"
              onClose={() => setPicker(false)}
              onPick={(img) => set({ avatar_url: img.url, avatar_alt: { ...form.avatar_alt, en: img.alt } })}
            />
          </Panel>
        )}
      </div>
    </div>
  );
}
