import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { localizeDigits } from "@/lib/i18n";
import type { Locale } from "@/lib/site";

export default function Pagination({
  lang,
  page,
  pages,
  hrefFor,
  t,
}: {
  lang: Locale;
  page: number;
  pages: number;
  hrefFor: (p: number) => string;
  t: Dictionary["common"];
}) {
  if (pages <= 1) return null;
  const btn = "inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-blue-200 hover:text-blue-700";
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={btn}>
          <ArrowLeftIcon size={16} weight="bold" /> {t.previous}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted">
        {t.page} {localizeDigits(page, lang)} {t.of} {localizeDigits(pages, lang)}
      </span>
      {page < pages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={btn}>
          {t.next} <ArrowRightIcon size={16} weight="bold" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
