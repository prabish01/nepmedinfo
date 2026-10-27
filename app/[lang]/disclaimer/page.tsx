import type { Metadata } from "next";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import JsonLd from "@/components/site/JsonLd";
import { getDictionary } from "@/lib/i18n";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { type Locale, localePath } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/disclaimer">): Promise<Metadata> {
  const lang = (await params).lang as Locale;
  const t = getDictionary(lang).disclaimer;
  return pageMetadata({ lang, title: t.metaTitle, description: t.metaDescription, path: "/disclaimer" });
}

export default async function DisclaimerPage({ params }: PageProps<"/[lang]/disclaimer">) {
  const lang = (await params).lang as Locale;
  const dict = getDictionary(lang);
  const t = dict.disclaimer;
  const crumbs = [
    { name: dict.common.home, path: localePath(lang, "/") },
    { name: t.title, path: localePath(lang, "/disclaimer") },
  ];
  return (
    <div className="container-x pt-8">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <article className="mt-8 max-w-[720px]">
        <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">{t.title}</h1>
        <div className="prose-med mt-8">
          {t.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
