"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/actions";
import { Button, Field, Input } from "./ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password" error={state?.error}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" disabled={pending} className="w-full py-3">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
