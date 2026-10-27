import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { type Locale, localePath } from "@/lib/site";

export default function SearchForm({
  lang,
  placeholder,
  button,
  defaultValue,
  size = "lg",
  id = "q",
}: {
  lang: Locale;
  placeholder: string;
  button: string;
  defaultValue?: string;
  size?: "lg" | "md";
  id?: string;
}) {
  const lg = size === "lg";
  return (
    <form action={localePath(lang, "/search")} method="get" role="search" className="w-full">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <div
        className={`flex items-center gap-2 rounded-full border border-line bg-white shadow-[0_12px_40px_-18px_rgba(11,42,85,0.35)] transition focus-within:border-blue-500 ${
          lg ? "p-2 pl-5" : "p-1.5 pl-4"
        }`}
      >
        <MagnifyingGlassIcon size={lg ? 22 : 18} weight="bold" className="shrink-0 text-blue-700" aria-hidden />
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete="off"
          className={`min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted/80 ${lg ? "py-2 text-[1.02rem]" : "py-1.5 text-[0.95rem]"}`}
        />
        <button
          type="submit"
          className={`shrink-0 rounded-full bg-blue-700 font-semibold text-white transition hover:bg-blue-800 active:scale-[0.98] ${
            lg ? "px-6 py-3 text-[0.95rem]" : "px-4 py-2 text-sm"
          }`}
        >
          {button}
        </button>
      </div>
    </form>
  );
}
