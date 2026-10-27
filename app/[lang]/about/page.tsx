import { EnvelopeSimpleIcon, HandshakeIcon, MagnifyingGlassPlusIcon, PencilSimpleLineIcon, SealCheckIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import JsonLd from "@/components/site/JsonLd";
import { getDictionary } from "@/lib/i18n";
import { breadcrumbLd, orgId, pageMetadata } from "@/lib/seo";
import { type Locale, absoluteUrl, localePath, site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const lang = (await params).lang as Locale;
  const t = getDictionary(lang).about;
  return pageMetadata({ lang, title: t.metaTitle, description: t.metaDescription, path: "/about" });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const lang = (await params).lang as Locale;
  const dict = getDictionary(lang);
  const t = dict.about;
  const icons = [MagnifyingGlassPlusIcon, SealCheckIcon, HandshakeIcon, PencilSimpleLineIcon];
  const crumbs = [
    { name: dict.common.home, path: localePath(lang, "/") },
    { name: dict.nav.about, path: localePath(lang, "/about") },
  ];

  return (
    <div className="pt-8">
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          { "@context": "https://schema.org", "@type": "AboutPage", url: absoluteUrl(localePath(lang, "/about")), name: t.metaTitle, about: { "@id": orgId } },
        ]}
      />
      <div className="container-x">
        <Breadcrumbs items={crumbs} />
        <section className="mt-8 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-ink md:text-[3.2rem]">{t.title}</h1>
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">{t.intro}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-blue-50">
            <Image
              src="/images/hero-fchv.webp"
              alt="A female community health volunteer in Salyan district talks with expectant mothers about regular antenatal check-ups"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        <section className="mt-20 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">{t.missionTitle}</h2>
          <div className="space-y-5 text-lg leading-relaxed text-ink/80">
            {t.mission.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section id="standards" className="mt-20 scroll-mt-28" aria-labelledby="standards-h">
          <h2 id="standards-h" className="text-3xl font-semibold tracking-tight text-ink md:text-[2.4rem]">
            {t.standardsTitle}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {t.standards.map((s, i) => {
              const Icon = icons[i];
              return (
                <div key={s.title} className={`rounded-3xl p-7 md:p-8 ${i === 1 ? "bg-blue-700 text-white" : i === 2 ? "bg-leaf-soft" : "bg-white ring-1 ring-line"}`}>
                  <Icon size={30} weight="duotone" className={i === 1 ? "text-leaf" : "text-blue-700"} />
                  <h3 className={`mt-5 text-xl font-semibold ${i === 1 ? "text-white" : "text-ink"}`}>{s.title}</h3>
                  <p className={`mt-2 leading-relaxed ${i === 1 ? "text-white/80" : "text-muted"}`}>{s.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20 rounded-3xl bg-navy px-6 py-12 text-white md:px-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t.languageTitle}</h2>
              <p className="mt-4 leading-relaxed text-white/75">{t.language}</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t.contactTitle}</h2>
              <p className="mt-4 leading-relaxed text-white/75">{t.contact}</p>
              <a href={`mailto:${site.email}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3.5 font-semibold text-navy transition hover:bg-leaf-strong">
                <EnvelopeSimpleIcon size={18} weight="bold" /> {site.email}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
