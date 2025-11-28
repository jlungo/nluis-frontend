/* =====================================================================================
 * Inline typings for Mammoth + docx-preview (kept in this file as requested)
 * ===================================================================================== */
// Note: Types for "mammoth/mammoth.browser" are provided in `src/types/mammoth-browser.d.ts`.

// Put this constant at top-level in the file
const DOCX_PREVIEW_CSS_CDN =
  "https://cdn.jsdelivr.net/npm/docx-preview@0.3.1/dist/docx-preview.css";

// Call this once to inject the stylesheet tag
function ensureDocxPreviewCss() {
  if (typeof document === "undefined") return;
  if (document.querySelector('link[data-docx-preview-css]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = DOCX_PREVIEW_CSS_CDN;
  link.setAttribute("data-docx-preview-css", "1");
  document.head.appendChild(link);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare module "docx-preview" {
  export function renderAsync(
    data: ArrayBuffer | Blob | Uint8Array,
    container: HTMLElement,
    style?: unknown,
    options?: {
      className?: string;
      inWrapper?: boolean;
      ignoreWidth?: boolean;
      ignoreHeight?: boolean;
      ignoreFonts?: boolean;
      breakPages?: boolean;
      useBase64URL?: boolean;
      useMathMLPolyfill?: boolean;
    }
  ): Promise<void>;
}

/* =====================================================================================
 * Component
 * ===================================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {Table} from "@tiptap/extension-table";
import {TableRow} from "@tiptap/extension-table";
import {TableCell} from "@tiptap/extension-table";
import {TableHeader} from "@tiptap/extension-table";

import * as mammoth from "mammoth/mammoth.browser";
import { renderAsync as renderDocx } from "docx-preview";
// import "docx-preview/dist/docx-preview.css"; // required for proper colors/alignment

import DOMPurify from "dompurify";

/* If you don't use shadcn/ui, swap these with your own components */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
// Tabs removed in favor of a unified layout

import {
  Link2,
  Upload,
  RefreshCw,
  Download,
  Image as ImageIcon,
  FileText,
  Loader2,
  Eraser,
} from "lucide-react";

/* ---------------------------
 * Types & helpers
 * --------------------------*/
type PlaceholderKind = "text" | "image" | "html";
type PlaceholderMeta = { key: string; kind: PlaceholderKind; label: string; section: string };

type PlaceholderValue =
  | { kind: "text"; value: string }
  | { kind: "image"; src: string; alt?: string }
  | { kind: "html"; value: string };

const DEFAULT_TEMPLATE_HTML = `
<article>
  <header style="text-align:center;margin-bottom:1rem;color:#0f4c81">
    <h1>{{ header.title }}</h1>
    <div class="muted">Date: {{ header.date }}</div>
  </header>

  <section>
    <h2 style="color:#2b7a0b">Introduction</h2>
    <p>Village: <strong>{{ intro.village_name }}</strong></p>
  </section>

  <section>
    <h2>Statistics</h2>
    <ul>
      <li>Population: {{ stats.population }}</li>
      <li>Area: {{ stats.area_km2 }} km²</li>
    </ul>
  </section>

  <section>
    <h2>Overview Map</h2>
    <div class="map-frame">{{ maps.overview_img }}</div>
  </section>

  <section>
    <h2>Land Use Breakdown</h2>
    <div class="table-frame">{{ stats.land_use_table_html }}</div>
  </section>
</article>
`.trim();

// Heuristics: *_html => HTML, *_img/*_image/*_png/*_jpg/*_jpeg/*_gif => image, else text
function guessKind(key: string): PlaceholderKind {
  const k = key.toLowerCase();
  if (k.endsWith("_html")) return "html";
  if (/_img$|_image$|_png$|_jpg$|_jpeg$|_gif$/.test(k)) return "image";
  return "text";
}

function titleCase(s: string): string {
  return s.replace(/[_.-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function parsePlaceholders(html: string): PlaceholderMeta[] {
  const set = new Set<string>();
  const re = /\{\{\s*([\w\.-]+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) set.add(m[1]);

  return Array.from(set).map((key) => {
    const parts = key.split(".");
    const section = titleCase(parts[0] || "Section");
    const label = titleCase(parts[parts.length - 1] || key);
    return { key, kind: guessKind(key), label, section };
  });
}

function replaceAllPlaceholders(html: string, values: Record<string, PlaceholderValue>): string {
  return html.replace(/\{\{\s*([\w\.-]+)\s*\}\}/g, (_, key) => {
    const v = values[key];
    // If no value provided, keep the placeholder token visible in the editor
    if (!v) return `{{ ${key} }}`;
    if (v.kind === "text") return escapeHtml(v.value || "");
    if (v.kind === "html") return v.value || "";
    if (v.kind === "image") {
      const alt = v.alt ? ` alt="${escapeHtml(v.alt)}"` : ` alt="${key}"`;
      return `<img src="${v.src}"${alt} style="max-width:100%;height:auto;border:1px solid #e5e5e5;border-radius:4px" />`;
    }
    return "";
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------------------------
 * Component
 * --------------------------*/
export default function ReportEditor() {
  const [loading, setLoading] = useState(false);
  const [docxName, setDocxName] = useState<string>("");
  const [rawTemplateHtml, setRawTemplateHtml] = useState<string>(DEFAULT_TEMPLATE_HTML);
  const [filterUnfilledOnly, setFilterUnfilledOnly] = useState(false);
  const [autoApply, setAutoApply] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [lastDocxArrayBuffer, setLastDocxArrayBuffer] = useState<ArrayBuffer | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureDocxPreviewCss();
  }, []);
  
  // TipTap with richer schema to keep more formatting
  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      ImageExt,
      TextStyle,
      Color,
      Underline,
      FontFamily,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: DOMPurify.sanitize(DEFAULT_TEMPLATE_HTML, {
      ALLOWED_ATTR: ["class", "style", "href", "src", "alt", "colspan", "rowspan", "width", "height", "align"],
    }),
    autofocus: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none",
      },
    },
  });

  // Detect placeholders from current editor content
  const placeholders = useMemo<PlaceholderMeta[]>(() => {
    const html = editor?.getHTML() ?? rawTemplateHtml;
    return parsePlaceholders(html);
  }, [editor, rawTemplateHtml, editor?.state]);

  // Values users supply for placeholders
  const [values, setValues] = useState<Record<string, PlaceholderValue>>({
    "header.title": { kind: "text", value: "Village Land Use Report" },
    "header.date": { kind: "text", value: new Date().toISOString().slice(0, 10) },
    "intro.village_name": { kind: "text", value: "Mto wa Mbu" },
    "stats.population": { kind: "text", value: "17854" },
    "stats.area_km2": { kind: "text", value: "247.92" },
    "maps.overview_img": { kind: "image", src: "" }, // user can upload or paste URL
    "stats.land_use_table_html": { kind: "html", value: "<em>Table will be inserted here…</em>" },
  });

  const filteredPlaceholders = placeholders.filter((p) =>
    filterUnfilledOnly
      ? !values[p.key] ||
        (values[p.key].kind === "text" && !(values[p.key] as any).value) ||
        (values[p.key].kind === "image" && !(values[p.key] as any).src)
      : true
  );

  // Auto-apply placeholders into the current editor content when toggled on
  useEffect(() => {
    if (!editor || !autoApply) return;
    const currentHtml = editor.getHTML();
    const rendered = replaceAllPlaceholders(currentHtml, values);
    editor.commands.setContent(
      DOMPurify.sanitize(rendered, {
        ALLOWED_ATTR: ["class", "style", "href", "src", "alt", "colspan", "rowspan", "width", "height", "align"],
      }),
      { emitUpdate: false }
    );
  }, [editor, values, autoApply]);

  // Re-render DOCX preview whenever the panel opens and we have a file
  useEffect(() => {
    if (!showPreview || !lastDocxArrayBuffer || !previewRef.current) return;
    previewRef.current.innerHTML = "";
    renderDocx(lastDocxArrayBuffer, previewRef.current, undefined, {
      className: "docx-wrapper",
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      breakPages: false,
      useBase64URL: true,
    }).catch(() => {});
  }, [showPreview, lastDocxArrayBuffer]);

  /* ---------------------------
   * DOCX loader + dual-mode render
   * --------------------------*/
  

  const onDocxUpload = async (file: File) => {
    const isDocx =
      /\.docx$/i.test(file.name) ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!isDocx) {
      alert("This loader supports .docx only. Please convert .doc/.docs to .docx and try again.");
      return;
    }

    setLoading(true);
    setDocxName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      setLastDocxArrayBuffer(arrayBuffer);

      // 1) High-fidelity preview (colors, alignment) — read-only
      if (showPreview && previewRef.current) {
        previewRef.current.innerHTML = ""; // clear previous
        await renderDocx(arrayBuffer, previewRef.current, undefined, {
          className: "docx-wrapper",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: false,
          useBase64URL: true,
        });
      }

      // 2) Editable HTML (best effort) — TipTap content
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        { includeEmbeddedStyleMap: true, styleMap: [] }
      );
      const html = DOMPurify.sanitize(result.value || "", {
        ALLOWED_ATTR: ["class", "style", "href", "src", "alt", "colspan", "rowspan", "width", "height", "align"],
      });
      setRawTemplateHtml(html);
      editor?.commands.setContent(html, { emitUpdate: false });

      if (Array.isArray(result.messages) && result.messages.length) {
        // eslint-disable-next-line no-console
        console.warn("Mammoth messages:", result.messages);
      }

      // Keep user on editor; user can open Preview panel when needed
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert("Failed to load .docx template. Make sure the file is a valid .docx and try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
   * Apply values to template
   * --------------------------*/
  const renderIntoEditor = () => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const rendered = replaceAllPlaceholders(currentHtml, values);
    editor.commands.setContent(
      DOMPurify.sanitize(rendered, {
        ALLOWED_ATTR: ["class", "style", "href", "src", "alt", "colspan", "rowspan", "width", "height", "align"],
      }),
      { emitUpdate: false }
    );
  };

  const resetToTemplate = () => {
    if (!editor) return;
    editor.commands.setContent(
      DOMPurify.sanitize(rawTemplateHtml || DEFAULT_TEMPLATE_HTML, {
        ALLOWED_ATTR: ["class", "style", "href", "src", "alt", "colspan", "rowspan", "width", "height", "align"],
      }),
      { emitUpdate: false }
    );
  };

  const exportRenderedHtml = () => {
    const html = editor?.getHTML() || "";
    const doc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Report</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica Neue,Arial,sans-serif;line-height:1.6;padding:24px}
  .muted{color:#666}
  img{max-width:100%;height:auto}
</style>
</head><body>${html}</body></html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /* ---------------------------
   * UI
   * --------------------------*/
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Link2 className="h-3.5 w-3.5" /> Report Builder
          </Badge>
          <Badge variant="outline">
            {docxName ? `Template: ${docxName}` : "Template: inline"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => e.target.files?.[0] && onDocxUpload(e.target.files[0])}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Load .docx
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              setShowPreview(true);
              if (lastDocxArrayBuffer && previewRef.current) {
                previewRef.current.innerHTML = "";
                await renderDocx(lastDocxArrayBuffer, previewRef.current, undefined, {
                  className: "docx-wrapper",
                  inWrapper: true,
                  ignoreWidth: false,
                  ignoreHeight: false,
                  breakPages: false,
                  useBase64URL: true,
                });
              }
            }}
            disabled={!lastDocxArrayBuffer}
          >
            <FileText className="h-4 w-4 mr-2" /> Preview
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={resetToTemplate}>
            <Eraser className="h-4 w-4 mr-2" /> Reset to Template
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={exportRenderedHtml}>
            <Download className="h-4 w-4 mr-2" /> Export HTML
          </Button>
        </div>
      </div>
      {/* Main layout: Editor + Placeholders side-by-side */}
      <div className="grid grid-cols-12 gap-3">
        {/* Editor with toolbar */}
        <div className="col-span-8 min-h-0">
          <Card className="min-h-0 flex flex-col">
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Template Editor (TipTap)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()} disabled={!editor}>
                  <strong>B</strong>
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={!editor}>
                  <em>I</em>
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleUnderline().run()} disabled={!editor}>
                  <span style={{ textDecoration: 'underline' }}>U</span>
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().setParagraph().run()} disabled={!editor}>P</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} disabled={!editor}>H1</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} disabled={!editor}>H2</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} disabled={!editor}>H3</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={!editor}>• List</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleOrderedList().run()} disabled={!editor}>1. List</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().setTextAlign('left').run()} disabled={!editor}>Left</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().setTextAlign('center').run()} disabled={!editor}>Center</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().setTextAlign('right').run()} disabled={!editor}>Right</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const url = window.prompt('Image URL');
                  if (url) editor?.chain().focus().setImage({ src: url }).run();
                }} disabled={!editor}>
                  <ImageIcon className="h-4 w-4 mr-1" /> Img
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const url = window.prompt('Link URL');
                  if (!url) return;
                  editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                }} disabled={!editor}>
                  Link
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={!editor}>
                  Table
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={autoApply} onCheckedChange={(v) => setAutoApply(Boolean(v))} />
                    Auto-apply placeholders
                  </Label>
                  {!autoApply && (
                    <Button type="button" size="sm" variant="outline" onClick={renderIntoEditor}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Apply Now
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded p-3 min-h-[70vh]">
                <EditorContent editor={editor} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The editor keeps most formatting (colors, alignment, tables). Exact DOCX fidelity may still differ after conversion.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholders panel */}
        <div className="col-span-4 min-h-0">
          <Card className="min-h-0 flex flex-col">
            <CardHeader className="py-3">
              <CardTitle className="text-base">Placeholders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground">
                  Found <strong>{placeholders.length}</strong> placeholders
                </div>
                <Label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <Checkbox
                    checked={filterUnfilledOnly}
                    onCheckedChange={(v) => setFilterUnfilledOnly(Boolean(v))}
                  />
                  Unfilled only
                </Label>
              </div>

              <ScrollArea className="h-[70vh] pr-2">
                <div className="space-y-3">
                  {filteredPlaceholders.map((p) => {
                    const v = values[p.key];
                    return (
                      <div key={p.key} className="border rounded p-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{p.label}</div>
                            <div className="text-xs text-muted-foreground truncate">{p.key}</div>
                          </div>
                          <Badge variant={p.kind === "image" ? "secondary" : "outline"}>
                            {p.kind.toUpperCase()}
                          </Badge>
                        </div>

                        {p.kind === "text" && (
                          <Input
                            value={(v && v.kind === "text" ? (v as any).value : "") || ""}
                            placeholder="Enter text…"
                            onChange={(e) =>
                              setValues((prev) => ({
                                ...prev,
                                [p.key]: { kind: "text", value: e.target.value },
                              }))
                            }
                          />
                        )}

                        {p.kind === "html" && (
                          <textarea
                            className="w-full h-24 rounded border bg-background p-2 text-sm font-mono"
                            placeholder="<strong>Custom HTML…</strong>"
                            value={(v && v.kind === "html" ? (v as any).value : "") || ""}
                            onChange={(e) =>
                              setValues((prev) => ({
                                ...prev,
                                [p.key]: { kind: "html", value: e.target.value },
                              }))
                            }
                          />
                        )}

                        {p.kind === "image" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="inline-flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const url = URL.createObjectURL(file);
                                    setValues((prev) => ({
                                      ...prev,
                                      [p.key]: { kind: "image", src: url, alt: p.label },
                                    }));
                                  }}
                                />
                                <Button type="button" size="sm" variant="outline">
                                  <ImageIcon className="h-4 w-4 mr-2" /> Upload Image
                                </Button>
                              </label>
                              <Input
                                placeholder="…or paste image URL"
                                value={(v && v.kind === "image" ? (v as any).src : "") || ""}
                                onChange={(e) =>
                                  setValues((prev) => ({
                                    ...prev,
                                    [p.key]: { kind: "image", src: e.target.value, alt: p.label },
                                  }))
                                }
                              />
                            </div>
                            {v && v.kind === "image" && (v as any).src ? (
                              <img
                                src={(v as any).src}
                                alt={(v as any).alt || p.label}
                                className="max-h-32 rounded border"
                              />
                            ) : (
                              <div className="text-xs text-muted-foreground">No image selected.</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!filteredPlaceholders.length && (
                    <div className="text-sm text-muted-foreground p-4 text-center">
                      {placeholders.length
                        ? "All placeholders are filled."
                        : "No placeholders detected in the template."}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right-side Preview Panel */}
      {showPreview && (
        <div className="fixed inset-y-0 right-0 w-[75vw] bg-background shadow-xl border-l z-50 flex flex-col">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="font-medium text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" /> High-fidelity Preview
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
          </div>

          <div className="p-3 overflow-auto">
            {lastDocxArrayBuffer ? (
              <>
                <div ref={previewRef} className="docx bg-white p-4 border rounded max-h-[calc(100vh-120px)] overflow-auto" />
                <p className="text-xs text-muted-foreground mt-2">
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Upload a .docx first to preview here.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
