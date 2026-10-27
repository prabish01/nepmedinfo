import { ArrowSquareOutIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { adminEntries } from "@/lib/admin/data";
import { type EntryType, entryPath, locales } from "@/lib/site";

export const metadata: Metadata = { title: "Content" };

const typeLabel: Record<EntryType, string> = { article: "Article", disease: "Disease", drug: "Drug / supplement" };
const statusTone: Record<string, string> = {
  draft: "bg-ground text-muted",
  review: "bg-warn-soft text-warn",
  published: "bg-leaf-soft text-green-700",
  archived: "bg-red-50 text-red-700",
};

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const type = typeof sp.type === "string" ? sp.type : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const all = await adminEntries();

  const entries = all.filter(
    (e) =>
      (!type || e.type === type) &&
      (!status || (status === "missing-ne" ? !e.translations.some((t) => t.locale === "ne") : e.status === status)) &&
      (!q || e.translations.some((t) => t.title.toLowerCase().includes(q) || t.slug.includes(q))),
  );

  const stats = [
    { label: "Published", value: all.filter((e) => e.status === "published").length, href: "?status=published" },
    { label: "Drafts", value: all.filter((e) => e.status === "draft").length, href: "?status=draft" },
    { label: "In review", value: all.filter((e) => e.status === "review").length, href: "?status=review" },
    { label: "Missing Nepali", value: all.filter((e) => !e.translations.some((t) => t.locale === "ne")).length, href: "?status=missing-ne" },
  ];
  const tab = (value: string, label: string) => {
    const params = new URLSearchParams({ ...(value ? { type: value } : {}), ...(status ? { status } : {}), ...(q ? { q } : {}) });
    const active = type === value;
    return (
      <Link
        key={value || "all"}
        href={`/admin?${params}`}
        className={`rounded-full px-4 py-2 text-[0.88rem] font-semibold transition ${active ? "bg-blue-700 text-white" : "text-ink/70 hover:bg-white"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="px-4 py-8 md:px-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Content</h1>
          <p className="mt-1 text-muted">Articles, diseases and medicines across both languages.</p>
        </div>
        <Link href="/admin/entries/new?type=article" className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-2.5 text-[0.9rem] font-semibold text-white transition hover:bg-blue-800">
          <PlusIcon size={16} weight="bold" /> New article
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={`/admin${s.href}`} className="rounded-2xl bg-white p-5 ring-1 ring-line transition hover:ring-blue-200">
            <p className="text-[0.85rem] text-muted">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-ink">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-ground-strong/60 p-1">
          {tab("", "All")}
          {tab("article", "Articles")}
          {tab("disease", "Diseases")}
          {tab("drug", "Drugs")}
        </nav>
        <form className="flex gap-2">
          {type && <input type="hidden" name="type" value={type} />}
          <label htmlFor="admin-q" className="sr-only">
            Search content
          </label>
          <input
            id="admin-q"
            name="q"
            defaultValue={q}
            placeholder="Search titles or slugs"
            className="w-full rounded-full border border-line bg-white px-4 py-2 text-[0.92rem] outline-none focus:border-blue-500 md:w-72"
          />
          <select name="status" defaultValue={status} className="rounded-full border border-line bg-white px-3 py-2 text-[0.88rem]" aria-label="Status">
            <option value="">Any status</option>
            <option value="draft">Draft</option>
            <option value="review">In review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="missing-ne">Missing Nepali</option>
          </select>
          <button className="rounded-full bg-white px-4 py-2 text-[0.88rem] font-semibold ring-1 ring-line">Filter</button>
        </form>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
        {entries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-ink">No content matches.</p>
            <p className="mt-1 text-muted">Clear the filters or create a new page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[0.92rem]">
              <thead className="border-b border-line bg-ground/60 text-[0.8rem] text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-3 py-3 font-semibold">Type</th>
                  <th className="px-3 py-3 font-semibold">Languages</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((e) => {
                  const main = e.translations.find((t) => t.locale === "en") ?? e.translations[0];
                  return (
                    <tr key={e.id} className="hover:bg-ground/50">
                      <td className="max-w-[380px] px-5 py-3.5">
                        <Link href={`/admin/entries/${e.id}`} className="line-clamp-1 font-semibold text-ink hover:text-blue-700">
                          {main?.title || "Untitled"}
                        </Link>
                        <span className="mt-0.5 block truncate text-[0.8rem] text-muted">/{main?.slug}</span>
                      </td>
                      <td className="px-3 py-3.5 text-muted">{typeLabel[e.type]}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex gap-1">
                          {locales.map((l) => {
                            const t = e.translations.find((x) => x.locale === l);
                            const cls = !t ? "bg-white text-muted/60 ring-1 ring-dashed ring-line" : t.is_ready ? "bg-blue-50 text-blue-800" : "bg-warn-soft text-warn";
                            return (
                              <span key={l} title={!t ? "Not written" : t.is_ready ? "Live when published" : "Hidden"} className={`rounded-md px-1.5 py-0.5 text-[0.72rem] font-bold uppercase ${cls}`}>
                                {l}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold capitalize ${statusTone[e.status]}`}>{e.status}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-muted">
                        {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(e.updated_at))}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {e.status === "published" && main && (
                          <a href={entryPath(main.locale, e.type, main.slug)} target="_blank" className="inline-grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-ground hover:text-blue-700" aria-label="View live page">
                            <ArrowSquareOutIcon size={17} />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
