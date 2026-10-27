import { ArrowRightIcon, BookOpenTextIcon, PillIcon, VirusIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import SearchForm from "@/components/site/SearchForm";
import { searchEntries } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { type Locale, entryPath } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/search">): Promise<Metadata> {
  const lang = (await params).lang as Locale;
  const dict = getDictionary(lang);
  return pageMetadata({ lang, title: dict.search.metaTitle, description: dict.meta.siteDescription, path: "/search", noindex: true });
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[lang]/search">) {
  const lang = (await params).lang as Locale;
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? "").trim();
  const dict = getDictionary(lang);
  const hits = q ? await searchEntries(lang, q) : [];
  const icon = { disease: VirusIcon, drug: PillIcon, article: BookOpenTextIcon };

  return (
    <div className="container-x pt-10">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          {q ? (
            <>
              {dict.search.resultsFor} <span className="mark-leaf">{q}</span>
            </>
          ) : (
            dict.search.title
          )}
        </h1>
        <div className="mt-8">
          <SearchForm lang={lang} placeholder={dict.search.placeholder} button={dict.home.searchButton} defaultValue={q} id="search-q" />
        </div>
      </div>

      <div className="mt-12 max-w-3xl">
        {!q && <p className="text-muted">{dict.search.prompt}</p>}
        {q && hits.length === 0 && <p className="rounded-3xl bg-ground p-8 text-muted">{dict.search.empty}</p>}
        {hits.length > 0 && (
          <ul className="space-y-3">
            {hits.map((h) => {
              const Icon = icon[h.type];
              return (
                <li key={h.id}>
                  <Link href={entryPath(lang, h.type, h.slug)} className="group flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-line transition hover:ring-blue-200">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700">
                      <Icon size={22} weight="duotone" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-[0.8rem] font-semibold text-green-700">{dict.entry[h.type]}</span>
                      <span className="mt-0.5 block text-lg font-semibold text-ink group-hover:text-blue-700">{h.title}</span>
                      <span className="mt-1 line-clamp-2 block text-[0.95rem] leading-relaxed text-muted">{h.excerpt}</span>
                    </span>
                    <ArrowRightIcon size={18} weight="bold" className="mt-1 shrink-0 text-muted transition group-hover:text-blue-700" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
