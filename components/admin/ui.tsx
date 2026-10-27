"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// Admin form primitives. Inputs are rounded-xl, buttons rounded-full, panels rounded-2xl.
const control =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[0.95rem] text-ink outline-none transition placeholder:text-muted/70 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-ground";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  counter,
  children,
  className = "",
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  counter?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[0.85rem] font-semibold text-ink">
          {label}
        </label>
        {counter}
      </div>
      {children}
      {hint && !error && <p className="text-[0.8rem] leading-snug text-muted">{hint}</p>}
      {error && <p className="text-[0.8rem] font-medium text-red-700">{error}</p>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} min-h-[90px] resize-y leading-relaxed ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${control} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2352637a'%3E%3Cpath d='M5.5 7.5 10 12l4.5-4.5'/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_10px_center] bg-no-repeat pr-9 ${props.className ?? ""}`} />;
}

export function Toggle({ checked, onChange, label, hint, id }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode; id: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="min-w-0">
        <span className="block text-[0.88rem] font-semibold text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-[0.8rem] leading-snug text-muted">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-blue-700" : "bg-ground-strong"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "leaf";
const variants: Record<Variant, string> = {
  primary: "bg-blue-700 text-white hover:bg-blue-800",
  secondary: "bg-white text-ink ring-1 ring-line hover:ring-blue-200 hover:text-blue-700",
  ghost: "text-muted hover:bg-ground hover:text-ink",
  danger: "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50",
  leaf: "bg-leaf text-navy hover:bg-leaf-strong",
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
        size === "sm" ? "px-3.5 py-1.5 text-[0.82rem]" : "px-5 py-2.5 text-[0.9rem]"
      } ${variants[variant]} ${className}`}
    />
  );
}

export function Panel({ title, children, action, className = "" }: { title?: ReactNode; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 ring-1 ring-line ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[0.95rem] font-semibold text-ink">{title}</h2>
          {action}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Character counter that turns amber/red outside the ideal range. */
export function Counter({ value, min, max }: { value: number; min: number; max: number }) {
  const tone = value === 0 ? "text-muted" : value < min ? "text-warn" : value > max ? "text-red-700" : "text-green-700";
  return (
    <span className={`text-[0.78rem] font-semibold tabular-nums ${tone}`}>
      {value} / {max}
    </span>
  );
}

/** Pixel-width bar approximating Google's ~580px title and ~920px description limits. */
export function WidthBar({ text, limitPx, fontPx }: { text: string; limitPx: number; fontPx: number }) {
  const approx = [...text].reduce((w, ch) => w + (/[ilI.,:;'|!]/.test(ch) ? 0.3 : /[mwMW]/.test(ch) ? 0.85 : /[A-Z]/.test(ch) ? 0.65 : 0.52) * fontPx, 0);
  const pct = Math.min(100, (approx / limitPx) * 100);
  const color = approx > limitPx ? "bg-red-500" : pct < 45 ? "bg-amber-400" : "bg-green-600";
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-ground" aria-hidden>
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "blue" | "red" }) {
  const tones = {
    neutral: "bg-ground text-muted",
    green: "bg-leaf-soft text-green-700",
    amber: "bg-warn-soft text-warn",
    blue: "bg-blue-50 text-blue-800",
    red: "bg-red-50 text-red-700",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold ${tones[tone]}`}>{children}</span>;
}
