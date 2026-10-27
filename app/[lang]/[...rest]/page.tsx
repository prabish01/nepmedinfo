import { notFound } from "next/navigation";

// Any unknown path inside a language renders the styled not-found page with a real 404.
export default function CatchAll() {
  notFound();
}
