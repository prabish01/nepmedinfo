"use client";

import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { Faq, Source } from "@/lib/types";
import { Input, Textarea } from "./ui";

function move<T>(list: T[], i: number, d: -1 | 1) {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function RowTools({ i, n, onMove, onRemove }: { i: number; n: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  const b = "grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-ground hover:text-ink disabled:opacity-30";
  return (
    <div className="flex shrink-0 gap-0.5">
      <button type="button" className={b} disabled={i === 0} onClick={() => onMove(-1)} aria-label="Move up">
        <ArrowUpIcon size={15} />
      </button>
      <button type="button" className={b} disabled={i === n - 1} onClick={() => onMove(1)} aria-label="Move down">
        <ArrowDownIcon size={15} />
      </button>
      <button type="button" className={`${b} hover:text-red-700`} onClick={onRemove} aria-label="Remove">
        <TrashIcon size={15} />
      </button>
    </div>
  );
}

const addBtn = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.85rem] font-semibold text-blue-700 hover:bg-blue-50";

export function StringList({ value, onChange, lang, placeholder, addLabel }: { value: string[]; onChange: (v: string[]) => void; lang: string; placeholder: string; addLabel: string }) {
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          <Input lang={lang} value={v} placeholder={placeholder} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          <RowTools i={i} n={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button type="button" className={addBtn} onClick={() => onChange([...value, ""])}>
        <PlusIcon size={14} weight="bold" /> {addLabel}
      </button>
    </div>
  );
}

export function FaqList({ value, onChange, lang }: { value: Faq[]; onChange: (v: Faq[]) => void; lang: string }) {
  return (
    <div className="space-y-3">
      {value.map((f, i) => (
        <div key={i} className="rounded-xl bg-ground/60 p-3">
          <div className="flex items-start gap-2">
            <Input lang={lang} value={f.q} placeholder="Question people ask" onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} className="font-semibold" />
            <RowTools i={i} n={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
          <Textarea lang={lang} value={f.a} rows={3} placeholder="Short, direct answer (2 to 4 sentences)" onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} className="mt-2" />
        </div>
      ))}
      <button type="button" className={addBtn} onClick={() => onChange([...value, { q: "", a: "" }])}>
        <PlusIcon size={14} weight="bold" /> Add question
      </button>
    </div>
  );
}

export function SourceList({ value, onChange }: { value: Source[]; onChange: (v: Source[]) => void }) {
  return (
    <div className="space-y-3">
      {value.map((s, i) => (
        <div key={i} className="rounded-xl bg-ground/60 p-3">
          <div className="flex items-start gap-2">
            <Input value={s.title} placeholder="Title, e.g. Dengue and severe dengue" onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
            <RowTools i={i} n={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1.4fr_1fr]">
            <Input type="url" value={s.url} placeholder="https://" onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
            <Input value={s.publisher ?? ""} placeholder="Publisher, e.g. WHO" onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, publisher: e.target.value } : x)))} />
          </div>
        </div>
      ))}
      <button type="button" className={addBtn} onClick={() => onChange([...value, { title: "", url: "", publisher: "" }])}>
        <PlusIcon size={14} weight="bold" /> Add source
      </button>
    </div>
  );
}

export function TagInput({ value, onChange, lang, placeholder, id }: { value: string[]; onChange: (v: string[]) => void; lang: string; placeholder: string; id: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().replace(/,$/, "");
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-2.5 pr-1 text-[0.82rem] font-medium text-blue-800" lang={lang}>
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="grid h-5 w-5 place-items-center rounded-full hover:bg-blue-100" aria-label={`Remove ${t}`}>
            <XIcon size={11} weight="bold" />
          </button>
        </span>
      ))}
      <input
        id={id}
        lang={lang}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[140px] flex-1 bg-transparent px-1.5 py-1 text-[0.92rem] outline-none"
      />
    </div>
  );
}
