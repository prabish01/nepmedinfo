// Uploads the built-in demo content (authors, categories, 13 pages in English and Nepali) to Supabase.
// Usage: npm run seed   (needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local)
import { createClient } from "@supabase/supabase-js";
import { demoAuthors, demoCategories, demoEntries } from "@/lib/demo";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  const must = <T,>(label: string, res: { error: { message: string } | null; data?: T }) => {
    if (res.error) throw new Error(`${label}: ${res.error.message}`);
    return res.data;
  };
  must("authors", await sb.from("authors").upsert(demoAuthors, { onConflict: "id" }));
  must("categories", await sb.from("categories").upsert(demoCategories, { onConflict: "id" }));
  for (const e of demoEntries) {
    const { translations, ...entry } = e;
    must(`entry ${e.id}`, await sb.from("entries").upsert(entry, { onConflict: "id" }));
    must(
      `translations ${e.id}`,
      await sb.from("entry_translations").upsert(
        translations.map((t) => ({ ...t, entry_id: e.id })),
        { onConflict: "entry_id,locale" },
      ),
    );
    console.log(`✓ ${e.type.padEnd(7)} ${translations.map((t) => t.locale).join("+")}  ${translations[0].title}`);
  }
  console.log("Seed complete.");
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
