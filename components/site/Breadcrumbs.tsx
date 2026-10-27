import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[0.85rem] text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.path} className="flex min-w-0 items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="truncate text-ink/80">
                  {it.name}
                </span>
              ) : (
                <>
                  <Link href={it.path} className="transition hover:text-blue-700">
                    {it.name}
                  </Link>
                  <CaretRightIcon size={12} weight="bold" className="text-muted/60" aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
