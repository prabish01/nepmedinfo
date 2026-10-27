# Nepal Med Info

Bilingual (English and Nepali) health information site for nepalmedinfo.com, with a built-in CMS.

- **Next.js 16** App Router, Tailwind v4, Phosphor icons
- **Supabase** for the database, auth and image storage
- **Tiptap** rich text editor in the CMS

The site runs without Supabase: it serves the built-in demo content from `lib/demo` until you add your keys.

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000
```

## Connecting Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings > API)
   - `SUPABASE_SERVICE_ROLE_KEY` (only needed for `npm run seed`, never exposed to the browser)
   - `NEXT_PUBLIC_SITE_URL=https://nepalmedinfo.com`
3. Open the SQL editor and run `supabase/migrations/0001_init.sql`. It creates the tables, row-level security, the `media` storage bucket and the search function.
4. In Authentication > Users, create your account (turn off public sign-ups in Auth settings).
5. Make yourself an admin:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   Use `role = 'editor'` for other writers.
6. Optional: load the demo pages into the database with `npm run seed`.
7. Restart the dev server and sign in at `/admin`.

## URLs and languages

| Page | English | Nepali |
| --- | --- | --- |
| Home | `/` | `/ne` |
| Diseases A-Z | `/diseases`, `/diseases/dengue` | `/ne/diseases`, `/ne/diseases/dengue` |
| Drugs and supplements | `/drugs`, `/drugs/paracetamol` | `/ne/drugs/...` |
| Articles | `/articles`, `/articles/category/nutrition` | `/ne/articles/...` |
| Authors | `/authors/editorial-team` | `/ne/authors/...` |

`proxy.ts` serves English at the root (internally `/en/...`) and redirects any `/en/...` URL to the clean path.

Each page has one row in `entries` and one row per language in `entry_translations`. Translations are written by hand in the CMS; there is no machine translation. If a page has no Nepali version, the language switcher sends readers to the Nepali section page, and the Nepali A-Z lists the English page with an `EN` tag.

UI text (navigation, headings, footer, About, disclaimer and privacy pages) lives in `lib/i18n/en.ts` and `lib/i18n/ne.ts`.

## The CMS (`/admin`)

- **Content**: every article, disease and drug, with filters for type, status and missing Nepali versions.
- **Editor**: English and Nepali tabs, title, URL slug (auto or locked), summary, alternate names, rich text body (H2 to H4, lists, links, quotes, tables, images), key points, FAQs, sources.
- **Publishing**: draft, ready for review, published, archived. Scheduled publishing via a future publish date. Each language version can be hidden independently. `Cmd/Ctrl + S` saves.
- **Medical review**: pick an author and a medical reviewer, plus the last-reviewed date. These appear on the page and in structured data.
- **SEO panel, per language**: focus keyword, SEO title and meta description with length meters, Google preview, a scored checklist (keyword placement, length, headings, alt text, internal links, sources), social title/description/image with a share preview, canonical URL, noindex.
- **Media library**: drag-and-drop upload. Photos are resized to 2000px and converted to WebP in the browser. Alt text is required before an image can be used, and stored in both languages. Images missing alt text are flagged.
- **Authors and reviewers**: names in both languages, credentials, NMC registration number, bio, photo and profile links.
- **Categories**: bilingual names and descriptions.

Saving invalidates the cache, so changes appear on the live site immediately.

## SEO built in

- Per-page title, meta description, canonical and `hreflang` (en, ne, x-default)
- JSON-LD: Organization, WebSite with SearchAction, MedicalWebPage, MedicalCondition / Drug, Article, FAQPage, BreadcrumbList, CollectionPage, ProfilePage, Person (author and reviewer)
- `sitemap.xml` with language alternates and images, `robots.txt`, web manifest
- Open Graph and Twitter cards. `/api/og` generates branded 1200x630 share images from the title. Nepali pages use the cover photo, or a brand-only card, because the image renderer cannot shape Devanagari conjuncts. The Nepali title still appears correctly in the share text.
- Static generation with hourly revalidation, plus instant revalidation on save
- Real 404 status codes, `/admin` sent with `noindex`

## Brand assets

`npm run brand` regenerates everything from `lib/brand.ts`:

- `app/favicon.ico` (16, 32 and 48 px), `app/icon.svg`, `app/apple-icon.png`
- `public/brand/`: `logo-mark.svg`, `logo-lockup.png`, `logo-lockup-white.png`, `logo-512.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript |
| `npm run seed` | Upload demo content to Supabase |
| `npm run brand` | Regenerate favicon, icons and logo files |

## Image credits

Photos in `public/images` come from Wikimedia Commons (source pages in `assets/image-credits.jsonl`):

- Health worker checking blood pressure, Pokhara: DFAT, CC BY 2.0
- Female community health volunteer, Salyan: USAID Nepal, public domain
- Pharmacist at Batulechaur Health Post: DFAT, CC BY 4.0
- Immunisation clinic, Pokhara: DFAT, CC BY 4.0
- Boy at a village water tap: DFAT, CC BY 4.0
- Asan Bazaar vegetable seller: Everhard van Eimeren, CC BY-SA 4.0
- Aedes aegypti: James Gathany, CDC, public domain

## Before launch

- Have a qualified clinician review the demo pages, or delete them. Add real reviewers in Authors.
- Replace `hello@nepalmedinfo.com` in `lib/site.ts` with a real inbox, and add social profile URLs to `site.social`.
- Submit `https://nepalmedinfo.com/sitemap.xml` in Google Search Console.
