import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import LogoMark from "@/components/brand/LogoMark";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { GridCard } from "@/components/site/Cards";
import JsonLd from "@/components/site/JsonLd";
import { getAuthor, getAuthors, listEntries } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { breadcrumbLd, pageMetadata, personLd } from "@/lib/seo";
import { type Locale, localePath } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    return (await getAuthors()).map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps<"/[lang]/authors/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const a = await getAuthor(slug);
  if (!a) return {};
  const l = lang as Locale;
  const name = a.name[l] || a.name.en || slug;
  return pageMetadata({
    lang: l,
    title: a.credentials ? `${name}, ${a.credentials}` : name,
    description: (a.bio[l] || a.bio.en || "").slice(0, 160),
    path: `/authors/${slug}`,
    image: a.avatar_url,
  });
}

export default async function AuthorPage({ params }: PageProps<"/[lang]/authors/[slug]">) {
  const { lang: raw, slug } = await params;
  const lang = raw as Locale;
  const a = await getAuthor(slug);
  if (!a) notFound();
  const dict = getDictionary(lang);
  const name = a.name[lang] || a.name.en || slug;
  const { items } = await listEntries(lang, { authorId: a.id, limit: 24 });
  const crumbs = [
    { name: dict.common.home, path: localePath(lang, "/") },
    { name: name, path: localePath(lang, `/authors/${slug}`) },
  ];

  return (
    <div className="container-x pt-8">
      <JsonLd data={[breadcrumbLd(crumbs), { "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: personLd(a, lang) }]} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-8 grid gap-6 rounded-3xl bg-blue-50 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center md:p-10">
        {a.avatar_url ? (
          <Image src={a.avatar_url} alt={a.avatar_alt[lang] || name} width={120} height={120} className="h-28 w-28 rounded-full object-cover" />
        ) : (
          <LogoMark size={112} />
        )}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">{name}</h1>
          {(a.credentials || a.job_title[lang] || a.job_title.en) && (
            <p className="mt-1.5 font-medium text-blue-800">{[a.credentials, a.job_title[lang] || a.job_title.en].filter(Boolean).join(" · ")}</p>
          )}
          {a.nmc_number && <p className="mt-1 text-sm text-muted">NMC {a.nmc_number}</p>}
          {(a.bio[lang] || a.bio.en) && <p className="mt-4 max-w-[70ch] leading-relaxed text-ink/80">{a.bio[lang] || a.bio.en}</p>}
        </div>
      </header>
      {items.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            {a.is_reviewer ? dict.author.reviewed : dict.author.articles} {name}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => (
              <GridCard key={e.id} e={e} lang={lang} t={dict.common} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
