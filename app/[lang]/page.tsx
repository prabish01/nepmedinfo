import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenTextIcon,
  ClipboardTextIcon,
  FirstAidKitIcon,
  PillIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
  TranslateIcon,
  VirusIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FeatureCard, RowCard } from "@/components/site/Cards";
import SearchForm from "@/components/site/SearchForm";
import { alphabet, letterId, letterOf } from "@/lib/az";
import { getIndex, listEntries } from "@/lib/content";
import { getDictionary, localizeDigits } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { type Locale, entryPath, localePath } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const lang = (await params).lang as Locale;
  const dict = getDictionary(lang);
  return pageMetadata({ lang, title: dict.meta.siteTitle, description: dict.meta.siteDescription, path: "/", absoluteTitle: true });
}

const btnPrimary =
  "inline-flex items-center gap-2 rounded-full bg-blue-700 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-800 active:scale-[0.98]";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const lang = (await params).lang as Locale;
  const dict = getDictionary(lang);
  const h = dict.home;
  const other: Locale = lang === "en" ? "ne" : "en";

  const [articles, drugs, featured, diseaseIndex] = await Promise.all([
    listEntries(lang, { type: "article", limit: 4 }),
    listEntries(lang, { type: "drug", limit: 4 }),
    listEntries(lang, { featured: true, limit: 3 }),
    getIndex(lang, "disease"),
  ]);
  const [lead, ...rest] = articles.items;
  const usedLetters = new Set(diseaseIndex.map((d) => letterOf(d.title)));
  const letters = alphabet(lang).filter((l) => lang === "en" || usedLetters.has(l) || /[ऀ-ॿ]/.test(l));

  const popularIcon = { disease: VirusIcon, drug: PillIcon, article: BookOpenTextIcon };

  return (
    <>
      {/* Hero: copy and search left, photo right with live "people are reading" links */}
      <section className="container-x pt-8 md:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div>
            <h1 className="font-display text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:text-5xl lg:text-[3.15rem] xl:text-[3.4rem]">
              {h.heroTitleA} <span className="mark-leaf">{h.heroTitleMark}</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted">{h.heroText}</p>
            <div className="mt-8 max-w-xl">
              <SearchForm lang={lang} placeholder={h.searchPlaceholder} button={h.searchButton} id="hero-q" />
            </div>
            <Link
              href={localePath(lang, "/diseases")}
              className="mt-5 inline-flex items-center gap-1.5 font-semibold text-blue-700 underline-offset-4 hover:underline"
            >
              {h.browseAz} <ArrowRightIcon size={16} weight="bold" />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -right-4 -top-4 hidden h-40 w-40 rounded-[2.5rem] bg-leaf-soft md:block" aria-hidden />
            <div className="relative aspect-[4/3.3] overflow-hidden rounded-3xl bg-blue-50">
              <Image
                src="/images/checkup.webp"
                alt="A health worker at a health post in Pokhara checks a woman's blood pressure while she holds her young daughter"
                fill
                priority
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
            </div>
            {featured.items.length > 0 && (
              <div className="relative mx-4 -mt-16 rounded-2xl bg-white p-4 shadow-[0_24px_60px_-24px_rgba(11,42,85,0.45)] ring-1 ring-line sm:mx-8 md:absolute md:-bottom-8 md:-left-8 md:mx-0 md:mt-0 md:w-[300px]">
                <p className="px-2 pb-2 text-sm font-semibold text-ink">{h.popular}</p>
                <ul>
                  {featured.items.map((e) => {
                    const Icon = popularIcon[e.type];
                    return (
                      <li key={e.id}>
                        <Link
                          href={entryPath(lang, e.type, e.slug)}
                          className="flex items-center gap-3 rounded-xl px-2 py-2 text-[0.93rem] text-ink transition hover:bg-ground"
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700">
                            <Icon size={17} weight="duotone" />
                          </span>
                          <span className="line-clamp-1 font-medium">{e.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* A-Z band */}
      <section className="container-x mt-20 md:mt-24" aria-labelledby="az-title">
        <div className="flex flex-col gap-5 rounded-3xl bg-leaf px-6 py-6 md:flex-row md:items-center md:gap-8 md:px-8">
          <h2 id="az-title" className="shrink-0 text-xl font-semibold tracking-tight text-navy">
            {h.azTitle}
          </h2>
          <ul className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 md:flex-wrap md:overflow-visible">
            {letters.map((l) => {
              const has = usedLetters.has(l);
              return (
                <li key={l} className="shrink-0">
                  {has ? (
                    <Link
                      href={`${localePath(lang, "/diseases")}#${letterId(l)}`}
                      className="grid h-9 min-w-9 place-items-center rounded-full bg-white px-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
                    >
                      {l}
                    </Link>
                  ) : (
                    <span className="grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm font-medium text-navy/45">{l}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Latest articles: one lead story and a stack of three */}
      {lead && (
        <section className="container-x mt-24" aria-labelledby="latest-title">
          <div className="max-w-2xl">
            <h2 id="latest-title" className="text-3xl font-semibold leading-tight tracking-tight text-ink md:text-[2.5rem]">
              {h.latestTitleA} <span className="mark-leaf">{h.latestTitleMark}</span>
            </h2>
            <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted">{h.latestText}</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
            <FeatureCard e={lead} lang={lang} t={dict.common} />
            <div className="flex flex-col gap-4">
              {rest.map((e) => (
                <RowCard key={e.id} e={e} lang={lang} t={dict.common} />
              ))}
              <Link
                href={localePath(lang, "/articles")}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 font-semibold text-ink transition hover:border-blue-200 hover:text-blue-700"
              >
                {dict.common.viewAll} <ArrowRightIcon size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bento: three ways into the site */}
      <section className="container-x mt-24" aria-labelledby="sections-title">
        <h2 id="sections-title" className="text-3xl font-semibold tracking-tight text-ink md:text-[2.5rem]">
          {h.sectionsTitle}
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-[minmax(240px,auto)_minmax(240px,auto)]">
          <Link
            href={localePath(lang, "/diseases")}
            className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-3xl p-7 text-white md:col-span-2 md:row-span-2 md:p-9"
          >
            <Image
              src="/images/hero-fchv.webp"
              alt="A female community health volunteer in Salyan talks with a group of expectant mothers about antenatal check-ups"
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/40 to-transparent" aria-hidden />
            <div className="relative max-w-md">
              <StethoscopeIcon size={30} weight="duotone" className="text-leaf" />
              <h3 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{dict.nav.diseases}</h3>
              <p className="mt-2 leading-relaxed text-white/85">{h.diseasesCard}</p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-navy">
                {localizeDigits(diseaseIndex.length, lang)} {h.diseasesCount}
                <ArrowUpRightIcon size={16} weight="bold" />
              </span>
            </div>
          </Link>

          <Link href={localePath(lang, "/drugs")} className="group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-3xl p-7 text-white">
            <Image
              src="/images/pharmacist.webp"
              alt="A pharmacist picking tablets from labelled medicine boxes"
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent" aria-hidden />
            <div className="relative">
              <PillIcon size={26} weight="duotone" className="text-leaf" />
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{dict.nav.drugs}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-white/85">{h.drugsCard}</p>
            </div>
          </Link>

          <Link
            href={localePath(lang, "/articles")}
            className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl bg-blue-700 p-7 text-white transition hover:bg-blue-800"
          >
            <BookOpenTextIcon size={26} weight="duotone" className="text-leaf" />
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{dict.nav.articles}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-white/80">{h.articlesCard}</p>
            </div>
            <ArrowUpRightIcon
              size={22}
              weight="bold"
              className="absolute right-7 top-7 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {/* Editorial process */}
      <section className="container-x mt-24" aria-labelledby="process-title">
        <div className="rounded-3xl bg-navy px-6 py-12 text-white md:px-12 md:py-16">
          <div className="max-w-2xl">
            <h2 id="process-title" className="text-3xl font-semibold tracking-tight md:text-[2.4rem]">
              {h.processTitle}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/70">{h.processText}</p>
          </div>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {h.steps.map((s, i) => {
              const Icon = [ClipboardTextIcon, TranslateIcon, ShieldCheckIcon, FirstAidKitIcon][i];
              return (
                <li key={s.title} className="relative lg:border-l lg:border-white/12 lg:px-7 lg:first:border-l-0 lg:first:pl-0">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf text-navy">
                    <Icon size={24} weight="duotone" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">
                    <span className="mr-2 text-leaf">{localizeDigits(i + 1, lang)}.</span>
                    {s.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-white/70">{s.text}</p>
                </li>
              );
            })}
          </ol>
          <Link href={`${localePath(lang, "/about")}#standards`} className="mt-12 inline-flex items-center gap-2 font-semibold text-leaf hover:underline">
            {dict.footer.editorial} <ArrowRightIcon size={16} weight="bold" />
          </Link>
        </div>
      </section>

      {/* Drugs and supplements as rows */}
      {drugs.items.length > 0 && (
        <section className="container-x mt-24" aria-labelledby="drugs-title">
          <div className="max-w-2xl">
            <h2 id="drugs-title" className="text-3xl font-semibold tracking-tight text-ink md:text-[2.5rem]">
              {h.drugsTitleA} <span className="mark-leaf">{h.drugsTitleMark}</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">{h.drugsText}</p>
          </div>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {drugs.items.map((d) => (
              <li key={d.id}>
                <Link
                  href={entryPath(lang, "drug", d.slug)}
                  className="group grid items-center gap-2 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto] md:gap-8"
                >
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-ink transition group-hover:text-blue-700">{d.title}</h3>
                    {d.alsoKnownAs.length > 0 && <p className="mt-0.5 truncate text-sm text-muted">{d.alsoKnownAs.slice(0, 2).join(", ")}</p>}
                  </div>
                  <p className="line-clamp-2 text-[0.95rem] leading-relaxed text-muted">{d.excerpt}</p>
                  <span className="hidden h-11 w-11 place-items-center rounded-full border border-line text-ink transition group-hover:border-blue-700 group-hover:bg-blue-700 group-hover:text-white md:grid">
                    <ArrowRightIcon size={18} weight="bold" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={localePath(lang, "/drugs")} className={`${btnPrimary} mt-8`}>
            {dict.common.viewAll} <ArrowRightIcon size={16} weight="bold" />
          </Link>
        </section>
      )}

      {/* Language */}
      <section className="container-x mt-24" aria-labelledby="lang-title">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-blue-50 md:grid-cols-[1fr_1.1fr]">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-[340px]">
            <Image
              src="/images/immunisation.webp"
              alt="A nurse gives a baby oral vaccine drops at an immunisation clinic in Pokhara"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="px-6 pb-10 md:px-4 md:py-12 md:pr-12">
            <h2 id="lang-title" className="text-3xl font-semibold leading-tight tracking-tight text-ink md:text-[2.3rem]">
              {h.languageTitle}
            </h2>
            <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-muted">{h.languageText}</p>
            <Link href={localePath(other, "/")} hrefLang={other} lang={other} className={`${btnPrimary} mt-7`}>
              {h.languageCta} <ArrowRightIcon size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
