import { redirect } from "next/navigation";
import Notice from "@/components/admin/Notice";
import Shell from "@/components/admin/Shell";
import { getStaffSession } from "@/lib/admin/auth";
import { signOut } from "../actions";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();

  if (session.state === "unconfigured") {
    return (
      <Notice title="Connect Supabase to start publishing">
        <p>The public site is running on built-in demo content. To use the CMS:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Copy <code>.env.example</code> to <code>.env.local</code> and add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </li>
          <li>
            Run <code>supabase/migrations/0001_init.sql</code> in the Supabase SQL editor.
          </li>
          <li>Create your user in Authentication, then make it an admin (below).</li>
          <li>Restart the dev server.</li>
        </ol>
        <pre>{`update public.profiles set role = 'admin'\nwhere email = 'you@example.com';`}</pre>
      </Notice>
    );
  }
  if (session.state === "anonymous") redirect("/admin/login");
  if (session.state === "no-access") {
    return (
      <Notice title="Your account does not have CMS access yet">
        <p>
          You are signed in as <strong className="text-ink">{session.email}</strong>, but this account is not an editor. Ask an admin to run:
        </p>
        <pre>{`update public.profiles set role = 'editor'\nwhere email = '${session.email}';`}</pre>
        <form action={signOut}>
          <button className="font-semibold text-blue-700 hover:underline">Sign out</button>
        </form>
      </Notice>
    );
  }
  return (
    <Shell email={session.email} role={session.role}>
      {children}
    </Shell>
  );
}
