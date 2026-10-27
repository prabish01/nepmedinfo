"use client";

import {
  ArrowCounterClockwiseIcon,
  ArrowClockwiseIcon,
  ImageIcon,
  LinkBreakIcon,
  LinkIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  MinusIcon,
  QuotesIcon,
  TableIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/site";
import MediaPicker from "./MediaPicker";

function Tool({ on, active, label, children, disabled }: { on: () => void; active?: boolean; label: string; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={on}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-[0.85rem] font-semibold transition disabled:opacity-30 ${
        active ? "bg-blue-700 text-white" : "text-ink/75 hover:bg-ground hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-line" aria-hidden />;

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      h4: e.isActive("heading", { level: 4 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      link: e.isActive("link"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      table: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("");

  const applyLink = () => {
    const url = href.trim();
    if (!url) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: /^(https?:|mailto:|tel:|\/|#)/.test(url) ? url : `https://${url}` }).run();
    setLinkOpen(false);
  };

  return (
    <div className="sticky top-[60px] z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <Tool label="Heading 2" active={s.h2} on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Tool>
        <Tool label="Heading 3" active={s.h3} on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </Tool>
        <Tool label="Heading 4" active={s.h4} on={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
          H4
        </Tool>
        <Sep />
        <Tool label="Bold" active={s.bold} on={() => editor.chain().focus().toggleBold().run()}>
          <TextBIcon size={17} weight="bold" />
        </Tool>
        <Tool label="Italic" active={s.italic} on={() => editor.chain().focus().toggleItalic().run()}>
          <TextItalicIcon size={17} weight="bold" />
        </Tool>
        <Tool label="Underline" active={s.underline} on={() => editor.chain().focus().toggleUnderline().run()}>
          <TextUnderlineIcon size={17} weight="bold" />
        </Tool>
        <Tool
          label="Link"
          active={s.link}
          on={() => {
            setHref(editor.getAttributes("link").href ?? "");
            setLinkOpen((v) => !v);
          }}
        >
          <LinkIcon size={17} weight="bold" />
        </Tool>
        <Sep />
        <Tool label="Bulleted list" active={s.bullet} on={() => editor.chain().focus().toggleBulletList().run()}>
          <ListBulletsIcon size={17} weight="bold" />
        </Tool>
        <Tool label="Numbered list" active={s.ordered} on={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListNumbersIcon size={17} weight="bold" />
        </Tool>
        <Tool label="Callout quote" active={s.quote} on={() => editor.chain().focus().toggleBlockquote().run()}>
          <QuotesIcon size={17} weight="bold" />
        </Tool>
        <Tool label="Divider" on={() => editor.chain().focus().setHorizontalRule().run()}>
          <MinusIcon size={17} weight="bold" />
        </Tool>
        <Sep />
        <Tool label="Insert image" on={onImage}>
          <ImageIcon size={17} weight="bold" />
        </Tool>
        <Tool label="Insert table" on={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <TableIcon size={17} weight="bold" />
        </Tool>
        <Sep />
        <Tool label="Undo" disabled={!s.canUndo} on={() => editor.chain().focus().undo().run()}>
          <ArrowCounterClockwiseIcon size={17} weight="bold" />
        </Tool>
        <Tool label="Redo" disabled={!s.canRedo} on={() => editor.chain().focus().redo().run()}>
          <ArrowClockwiseIcon size={17} weight="bold" />
        </Tool>
      </div>

      {linkOpen && (
        <div className="flex items-center gap-2 border-t border-line px-3 py-2">
          <input
            autoFocus
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://www.who.int/... or /diseases/dengue for an internal link"
            className="min-w-0 flex-1 rounded-lg border border-line px-3 py-1.5 text-[0.88rem] outline-none focus:border-blue-500"
          />
          <button type="button" onClick={applyLink} className="rounded-full bg-blue-700 px-3.5 py-1.5 text-[0.82rem] font-semibold text-white">
            Apply
          </button>
          {s.link && (
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setLinkOpen(false);
              }}
              className="grid h-8 w-8 place-items-center rounded-full text-red-700 hover:bg-red-50"
              aria-label="Remove link"
            >
              <LinkBreakIcon size={16} />
            </button>
          )}
        </div>
      )}

      {s.table && (
        <div className="flex flex-wrap items-center gap-1 border-t border-line px-3 py-1.5 text-[0.8rem]">
          <span className="mr-1 font-semibold text-muted">Table</span>
          {[
            ["Row above", () => editor.chain().focus().addRowBefore().run()],
            ["Row below", () => editor.chain().focus().addRowAfter().run()],
            ["Column left", () => editor.chain().focus().addColumnBefore().run()],
            ["Column right", () => editor.chain().focus().addColumnAfter().run()],
            ["Delete row", () => editor.chain().focus().deleteRow().run()],
            ["Delete column", () => editor.chain().focus().deleteColumn().run()],
            ["Toggle header row", () => editor.chain().focus().toggleHeaderRow().run()],
            ["Delete table", () => editor.chain().focus().deleteTable().run()],
          ].map(([label, fn]) => (
            <button key={label as string} type="button" onClick={fn as () => void} className="rounded-md px-2 py-1 text-ink/80 hover:bg-ground">
              {label as string}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Alt text bar for the selected image, so alt can be fixed after insertion. */
function ImageAltBar({ editor }: { editor: Editor }) {
  const sel = useEditorState({
    editor,
    selector: ({ editor: e }) => (e.isActive("image") ? { alt: (e.getAttributes("image").alt as string) ?? "", src: e.getAttributes("image").src as string } : null),
  });
  if (!sel) return null;
  return (
    <div className="flex items-center gap-2 border-t border-line bg-blue-50 px-3 py-2">
      <span className="text-[0.8rem] font-semibold text-blue-800">Image alt text</span>
      <input
        key={sel.src}
        defaultValue={sel.alt}
        onChange={(e) => editor.chain().updateAttributes("image", { alt: e.target.value }).run()}
        className={`min-w-0 flex-1 rounded-lg border bg-white px-3 py-1.5 text-[0.88rem] outline-none ${sel.alt ? "border-line" : "border-amber-400"}`}
        placeholder="Describe this image"
      />
    </div>
  );
}

export default function RichEditor({ value, onChange, lang, placeholder }: { value: string; onChange: (html: string) => void; lang: Locale; placeholder: string }) {
  const [picker, setPicker] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https", HTMLAttributes: { rel: null, target: null } },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "prose-med min-h-[420px] px-6 py-6 outline-none md:px-8", lang },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  // Swap content when the language tab changes.
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(value === "" && editor.isEmpty)) editor.commands.setContent(value, { emitUpdate: false });
    editor?.view.dom.setAttribute("lang", lang);
  }, [editor, value, lang]);

  const words = useEditorState({ editor, selector: ({ editor: e }) => (e ? e.getText().trim().split(/\s+/).filter(Boolean).length : 0) });

  if (!editor) return <div className="min-h-[480px] animate-pulse rounded-2xl bg-white ring-1 ring-line" />;

  return (
    <div className="rounded-2xl bg-white ring-1 ring-line focus-within:ring-blue-200">
      <Toolbar editor={editor} onImage={() => setPicker(true)} />
      <ImageAltBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex justify-between border-t border-line px-4 py-2 text-[0.78rem] text-muted">
        <span>Use H2 for main sections and H3 inside them. The page title is the H1.</span>
        <span className="tabular-nums">{words ?? 0} words</span>
      </div>
      <MediaPicker
        open={picker}
        lang={lang}
        onClose={() => setPicker(false)}
        onPick={(img) => editor.chain().focus().setImage({ src: img.url, alt: img.alt }).run()}
      />
    </div>
  );
}
