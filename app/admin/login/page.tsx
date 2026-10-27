import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/brand/Logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Logo />
          <h1 className="mt-10 text-3xl font-semibold tracking-tight text-ink">Sign in to the CMS</h1>
          <p className="mt-2 text-muted">Write, review and publish health content in English and Nepali.</p>
          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <p className="mt-8 rounded-2xl bg-warn-soft p-4 text-[0.92rem] text-warn">
              Supabase is not configured yet. Add your keys to <code>.env.local</code> and restart the server.
            </p>
          )}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-blue-700 lg:block">
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-leaf [clip-path:polygon(0_45%,28%_10%,42%_32%,68%_0,100%_42%,100%_100%,0_100%)]" />
        <div className="absolute left-1/2 top-[28%] h-48 w-48 -translate-x-1/2">
          <div className="absolute left-1/2 top-0 h-full w-14 -translate-x-1/2 rounded-2xl bg-white" />
          <div className="absolute left-0 top-1/2 h-14 w-full -translate-y-1/2 rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}
