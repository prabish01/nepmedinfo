import type { Metadata } from "next";
import CategoriesManager from "@/components/admin/CategoriesManager";
import { adminCategories } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  return <CategoriesManager categories={await adminCategories()} />;
}
