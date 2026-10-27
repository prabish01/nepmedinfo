import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { serverClient } from "@/lib/supabase/server";

export type StaffSession =
  | { state: "unconfigured" }
  | { state: "anonymous" }
  | { state: "no-access"; email: string | null; userId: string }
  | { state: "ok"; email: string | null; userId: string; role: "admin" | "editor" };

export async function getStaffSession(): Promise<StaffSession> {
  if (!isSupabaseConfigured) return { state: "unconfigured" };
  const sb = await serverClient();
  const { data } = await sb.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { state: "anonymous" };
  const email = (claims.email as string | undefined) ?? null;
  const { data: profile } = await sb.from("profiles").select("role").eq("id", claims.sub).maybeSingle();
  const role = profile?.role;
  if (role !== "admin" && role !== "editor") return { state: "no-access", email, userId: claims.sub };
  return { state: "ok", email, userId: claims.sub, role };
}

/** For server actions: returns an authenticated staff client or throws. */
export async function requireStaff() {
  const session = await getStaffSession();
  if (session.state !== "ok") throw new Error("Not authorised");
  return { sb: await serverClient(), session };
}
