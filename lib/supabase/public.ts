import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

let client: SupabaseClient | null = null;

/** Cookie-free anon client for public, cacheable reads. RLS limits it to published content. */
export function publicClient() {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured");
  client ??= createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
