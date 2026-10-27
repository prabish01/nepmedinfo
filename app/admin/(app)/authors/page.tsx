import type { Metadata } from "next";
import AuthorsManager from "@/components/admin/AuthorsManager";
import { adminAuthors } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Authors and reviewers" };

export default async function AuthorsPage() {
  return <AuthorsManager authors={await adminAuthors()} />;
}
