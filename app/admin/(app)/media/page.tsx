import type { Metadata } from "next";
import MediaLibrary from "@/components/admin/MediaLibrary";
import { adminMedia } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaPage() {
  return <MediaLibrary items={await adminMedia()} />;
}
