import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["600"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = { title: "Page not found | Nepal Med Info", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable}`}>
      <body className="grid min-h-dvh place-items-center bg-ground px-4">
        <main className="max-w-md text-center">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
          <p className="mt-10 font-display text-7xl font-semibold tracking-tight text-blue-700">404</p>
          <h1 className="mt-3 text-2xl font-semibold text-ink">We could not find that page</h1>
          <p className="mt-2 text-muted">The address may be mistyped, or the page may have moved.</p>
          <Link href="/" className="mt-8 inline-flex rounded-full bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800">
            Go to the homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
