"use client";

import { ArrowSquareOutIcon, FolderSimpleIcon, ImagesIcon, ListIcon, NewspaperIcon, SignOutIcon, UsersThreeIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import Logo from "@/components/brand/Logo";
import { signOut } from "@/app/admin/actions";

const nav = [
  { href: "/admin", label: "Content", Icon: NewspaperIcon, exact: true },
  { href: "/admin/media", label: "Media library", Icon: ImagesIcon },
  { href: "/admin/authors", label: "Authors & reviewers", Icon: UsersThreeIcon },
  { href: "/admin/categories", label: "Categories", Icon: FolderSimpleIcon },
];

export default function Shell({ email, role, children }: { email: string | null; role: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string, exact?: boolean) => (exact ? pathname === href || pathname.startsWith("/admin/entries") : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="px-2">
        <Logo />
      </Link>
      <nav className="mt-8 space-y-1" aria-label="CMS">
        {nav.map(({ href, label, Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.92rem] font-medium transition ${
              active(href, exact) ? "bg-blue-50 text-blue-800" : "text-ink/75 hover:bg-ground hover:text-ink"
            }`}
          >
            <Icon size={20} weight={active(href, exact) ? "fill" : "regular"} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 space-y-1 border-t border-line pt-6">
        <p className="px-3 pb-1 text-[0.78rem] font-semibold text-muted">Create</p>
        {[
          ["article", "New article"],
          ["disease", "New disease"],
          ["drug", "New drug or supplement"],
        ].map(([type, label]) => (
          <Link key={type} href={`/admin/entries/new?type=${type}`} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-[0.9rem] text-ink/75 hover:bg-ground hover:text-ink">
            + {label}
          </Link>
        ))}
      </div>
      <div className="mt-auto space-y-2 pt-8">
        <a href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-[0.88rem] text-ink/75 hover:bg-ground">
          <ArrowSquareOutIcon size={18} /> View site
        </a>
        <div className="rounded-xl bg-ground px-3 py-3">
          <p className="truncate text-[0.85rem] font-semibold text-ink">{email}</p>
          <p className="text-[0.78rem] capitalize text-muted">{role}</p>
          <form action={signOut}>
            <button className="mt-2 inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-blue-700 hover:underline">
              <SignOutIcon size={15} /> Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-r border-line bg-white px-4 py-6 lg:block">{sidebar}</aside>
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <Logo />
        <button className="grid h-10 w-10 place-items-center rounded-full border border-line" onClick={() => setOpen(true)} aria-label="Open menu">
          <ListIcon size={20} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-navy/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-[280px] bg-white px-4 py-6" onClick={(e) => e.stopPropagation()}>
            <button className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-ground" onClick={() => setOpen(false)} aria-label="Close menu">
              <XIcon size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <main className="min-w-0">{children}</main>
    </div>
  );
}
