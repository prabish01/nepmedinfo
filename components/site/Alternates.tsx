"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/site";

type Paths = Partial<Record<Locale, string>>;
const Ctx = createContext<{ paths: Paths | null; set: (p: Paths | null) => void }>({ paths: null, set: () => {} });

export function AlternatesProvider({ children }: { children: ReactNode }) {
  const [paths, set] = useState<Paths | null>(null);
  return <Ctx.Provider value={{ paths, set }}>{children}</Ctx.Provider>;
}

export function useAlternates() {
  return useContext(Ctx).paths;
}

/** Pages whose URL differs per language (entries) register their alternates for the language switcher. */
export function SetAlternates({ paths }: { paths: Paths }) {
  const { set } = useContext(Ctx);
  const key = JSON.stringify(paths);
  useEffect(() => {
    set(JSON.parse(key));
    return () => set(null);
  }, [key, set]);
  return null;
}
