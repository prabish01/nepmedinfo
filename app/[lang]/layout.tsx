import type { Metadata, Viewport } from "next";
import { Mukta, Plus_Jakarta_Sans, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import JsonLd from "@/components/site/JsonLd";
import { AlternatesProvider } from "@/components/site/Alternates";
import { getDictionary } from "@/lib/i18n";
import { organizationLd, pageMetadata, websiteLd } from "@/lib/seo";
import { isLocale, localeMeta, locales, site } from "@/lib/site";
import "../globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const mukta = Mukta({ variable: "--font-mukta", subsets: ["devanagari", "latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#14509e",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  // Defaults only. Every page sets its own canonical and hreflang alternates.
  const defaults = pageMetadata({ lang, title: dict.meta.siteTitle, description: dict.meta.siteDescription, path: "/" });
  delete defaults.alternates;
  return {
    ...defaults,
    metadataBase: new URL(site.url),
    title: { default: dict.meta.siteTitle, template: `%s | ${site.name}` },
    applicationName: site.name,
    category: "health",
    creator: site.name,
    publisher: site.name,
    formatDetection: { telephone: false, email: false, address: false },
    appleWebApp: { title: site.shortName, statusBarStyle: "default" },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={localeMeta[lang].htmlLang} className={`${sora.variable} ${jakarta.variable} ${mukta.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-blue-700 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {dict.nav.skip}
        </a>
        <AlternatesProvider>
          <Header lang={lang} nav={dict.nav} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer lang={lang} dict={dict} />
        </AlternatesProvider>
        <JsonLd data={[organizationLd(lang), websiteLd(lang)]} />
      </body>
    </html>
  );
}
