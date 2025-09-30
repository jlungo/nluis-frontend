import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeftRight, Beaker, Braces, Check, ChevronDown, Database, File as FileIcon, Globe, Link2, Loader2, RefreshCw, Search, Sparkles, X } from "lucide-react";
import clsx from "clsx";

type SourceType = "form_field" | "computed" | "constant" | "gis";

type Placeholder = { key: string; section?: string; label?: string; kind?: string };

type FieldNode = { id: number | string; label: string; type?: string; children?: FieldNode[] };

type SaveBinding = { placeholder: string; source_type: SourceType; form_field_id?: number | string | null; expression?: string | null; const_value?: string | null; format?: string | null; default_value?: string | null };

function flattenFields(nodes: FieldNode[]): FieldNode[] { const out: FieldNode[] = []; const walk = (n: FieldNode) => { out.push(n); n.children?.forEach(walk); }; nodes.forEach(walk); return out; }
const kindIcon = (kind?: string) => { switch (kind) { case "image": return <FileIcon className="h-3.5 w-3.5" />; case "table": return <TableGlyph />; case "number": return <HashGlyph />; default: return <Braces className="h-3.5 w-3.5" />; } };
function TableGlyph(){return(<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"/><path d="M3 10h18M9 20V4M15 20V4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>);} 
function HashGlyph(){return(<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>);} 

const MOCK_PLACEHOLDERS: Placeholder[] = [
  { key: "header.title", section: "Header", label: "Title" },
  { key: "header.date", section: "Header", label: "Date" },
  { key: "intro.village_name", section: "Introduction", label: "Village Name" },
  { key: "stats.population", section: "Statistics", label: "Population", kind: "number" },
  { key: "stats.area_km2", section: "Statistics", label: "Area (km²)", kind: "number" },
];

const MOCK_FIELD_TREE: FieldNode[] = [
  { id: "formA", label: "Demographics", children: [ { id: "f_pop", label: "Population", type: "number" }, { id: "f_households", label: "Households", type: "number" } ] },
  { id: "formB", label: "Land Use", children: [ { id: "f_area", label: "Total Area (km²)", type: "float" } ] },
];

const MOCK_EXISTING_BINDINGS: SaveBinding[] = [
  { placeholder: "header.title", source_type: "constant", const_value: "Village Land Use Report" },
  { placeholder: "header.date", source_type: "computed", expression: "today()" },
  { placeholder: "intro.village_name", source_type: "constant", const_value: "Mto wa Mbu" },
  { placeholder: "stats.population", source_type: "form_field", form_field_id: "f_pop", format: "int" },
  { placeholder: "stats.area_km2", source_type: "form_field", form_field_id: "f_area", format: "float:2" },
];

const MOCK_FORM_VALUES: Record<string, any> = {
  "f_pop": 17854,
  "f_households": 3569,
  "f_area": 247.92,
};

const TEMPLATE = `# {{ header.title }}\nDate: {{ header.date }}\n\nVillage: {{ intro.village_name }}\nPopulation: {{ stats.population }}\nArea: {{ stats.area_km2 }} km²`;

export default function FormReportBinding() {
  const [loading, setLoading] = useState(true);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [fieldTree, setFieldTree] = useState<FieldNode[]>([]);
  const [flatFields, setFlatFields] = useState<FieldNode[]>([]);
  const [bindings, setBindings] = useState<SaveBinding[]>([]);
  const [query, setQuery] = useState("");
  const [filterUnboundOnly, setFilterUnboundOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewLocality, setPreviewLocality] = useState<string>("1");
  const [previewContext, setPreviewContext] = useState<any | null>(null);
  const [previewRendered, setPreviewRendered] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPlaceholders(MOCK_PLACEHOLDERS);
      setFieldTree(MOCK_FIELD_TREE);
      setFlatFields(flattenFields(MOCK_FIELD_TREE));
      setBindings(MOCK_EXISTING_BINDINGS);
      setLoading(false);
    }, 200);
  }, []);

  const filteredPlaceholders = useMemo(() => {
    let list = placeholders;
    if (filterUnboundOnly) { const bound = new Set(bindings.map((b) => b.placeholder)); list = list.filter((p) => !bound.has(p.key)); }
    if (query.trim()) { const q = query.toLowerCase(); list = list.filter((p) => (p.label || p.key).toLowerCase().includes(q)); }
    return list;
  }, [placeholders, bindings, filterUnboundOnly, query]);

  const bySection = useMemo(() => {
    const map = new Map<string, Placeholder[]>();
    for (const p of filteredPlaceholders) { const s = p.section || "(no section)"; if (!map.has(s)) map.set(s, []); map.get(s)!.push(p); }
    return Array.from(map.entries());
  }, [filteredPlaceholders]);

  const dragRef = useRef<FieldNode | null>(null);
  const onDragStart = (field: FieldNode) => (e: React.DragEvent) => { dragRef.current = field; e.dataTransfer.effectAllowed = "link"; };
  const onDropToPlaceholder = (placeholder: Placeholder) => (e: React.DragEvent) => { e.preventDefault(); const field = dragRef.current; if (!field) return; upsertBinding({ placeholder: placeholder.key, source_type: "form_field", form_field_id: field.id }); dragRef.current = null; };

  const upsertBinding = (b: SaveBinding) => { setBindings((prev) => { const idx = prev.findIndex((x) => x.placeholder === b.placeholder); if (idx >= 0) { const clone = [...prev]; clone[idx] = { ...clone[idx], ...b }; return clone; } return [...prev, b]; }); };
  const removeBinding = (placeholderKey: string) => { setBindings((prev) => prev.filter((bi) => bi.placeholder !== placeholderKey)); };

  const handleSave = async () => { setSaving(true); setTimeout(()=> setSaving(false), 400); };

  const handlePreview = async () => {
    setPreviewing(true);
    const ctx = await buildPreviewContext(previewLocality, bindings);
    const rendered = renderTemplate(TEMPLATE, ctx);
    setPreviewContext(ctx);
    setPreviewRendered(rendered);
    setPreviewing(false);
  };

  if (loading) { return (<div className="w-full h-64 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>); }

  const boundMap = new Map(bindings.map((b) => [b.placeholder, b]));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1"><Link2 className="h-3.5 w-3.5"/> Bind report fields</Badge>
          <Badge variant="outline">workflow: vlus</Badge>
          <Badge variant="outline">version: 1</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Check className="h-4 w-4 mr-2"/>}Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3 min-h-0 space-y-3">
          <Card className="min-h-0 flex flex-col">
            <CardHeader className="py-3"><CardTitle className="text-base">Placeholders</CardTitle></CardHeader>
            <CardContent className="pt-0 flex-1 min-h-0">
              <div className="flex items-center gap-2 mb-2">
                <Input placeholder="Search…" value={query} onChange={(e)=>setQuery(e.target.value)} />
                <Label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <Checkbox checked={filterUnboundOnly} onCheckedChange={(v)=>setFilterUnboundOnly(Boolean(v))} />
                  Unbound
                </Label>
              </div>
              <ScrollArea className="h-[28vh] pr-2">
                <div className="space-y-3">
                  {bySection.map(([section, items]) => (
                    <div key={section}>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{section}</div>
                      <div className="space-y-1">
                        {items.map((p) => {
                          const bound = boundMap.get(p.key);
                          return (
                            <div key={p.key} onDragOver={(e)=>e.preventDefault()} onDrop={onDropToPlaceholder(p)} className={clsx("p-2 rounded border text-sm flex items-center justify-between", bound ? "bg-muted/60" : "bg-background")}> 
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="shrink-0 text-muted-foreground">{kindIcon(p.kind)}</span>
                                <div className="truncate" title={p.key}>
                                  <div className="font-medium truncate">{p.label || p.key.split(".").pop()}</div>
                                  <div className="text-xs text-muted-foreground truncate">{p.key}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {bound ? (
                                  <TooltipProvider><Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="max-w-[9rem] truncate" title={bindingLabel(bound, flatFields)}>
                                        <ArrowLeftRight className="h-3 w-3 mr-1"/>{bindingLabel(bound, flatFields)}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Bound to {bindingLabel(bound, flatFields)}</TooltipContent>
                                  </Tooltip></TooltipProvider>
                                ) : (
                                  <Badge variant="secondary">Drop a field</Badge>
                                )}
                                {bound && (
                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={()=>removeBinding(p.key)}>
                                    <X className="h-3.5 w-3.5"/>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="min-h-0 flex flex-col">
            <CardHeader className="py-3"><CardTitle className="text-base">Fields</CardTitle></CardHeader>
            <CardContent className="pt-0 flex-1 min-h-0">
              <ScrollArea className="h-[20vh] pr-2">
                <FieldTree nodes={fieldTree} onDragStart={onDragStart} />
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="min-h-0 flex flex-col">
            <CardHeader className="py-3"><CardTitle className="text-base">Binding editor</CardTitle></CardHeader>
            <CardContent className="pt-0 flex-1 min-h-0">
              <ScrollArea className="h-[28vh] pr-2">
                <div className="space-y-3">
                  {placeholders.map((p) => {
                    const b = boundMap.get(p.key);
                    if (!b) return null;
                    return (
                      <div key={p.key} className="border rounded p-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge variant="outline" className="shrink-0">{p.section || "section"}</Badge>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{p.label || p.key}</div>
                              <div className="text-xs text-muted-foreground truncate">{p.key}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={b.source_type} onValueChange={(v)=>upsertBinding({ ...b, source_type: v as SourceType })}>
                              <SelectTrigger className="w-40"><SelectValue placeholder="Source type"/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="form_field"><span className="inline-flex items-center gap-2"><Database className="h-4 w-4"/>Form field</span></SelectItem>
                                <SelectItem value="computed"><span className="inline-flex items-center gap-2"><Beaker className="h-4 w-4"/>Computed</span></SelectItem>
                                <SelectItem value="constant"><span className="inline-flex items-center gap-2"><FileIcon className="h-4 w-4"/>Constant</span></SelectItem>
                                <SelectItem value="gis"><span className="inline-flex items-center gap-2"><Globe className="h-4 w-4"/>GIS</span></SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-2">
                          {b.source_type === "form_field" && (
                            <FieldPicker inline fields={flatFields} value={b.form_field_id?.toString() || ""} onChange={(id)=>upsertBinding({ ...b, form_field_id: id })} />
                          )}
                          {b.source_type === "computed" && (
                            <div className="space-y-2">
                              <Label className="text-xs">Expression</Label>
                              <textarea className="w-full h-20 rounded border bg-background p-2 text-sm font-mono" placeholder={"today() | now('%Y-%m-%d')"} value={b.expression || ""} onChange={(e)=>upsertBinding({ ...b, expression: e.target.value })} />
                              <HelperSnippets onInsert={(code)=>upsertBinding({ ...b, expression: ((b.expression||"") + code).trim() })} />
                            </div>
                          )}
                          {b.source_type === "constant" && (
                            <div className="space-y-2">
                              <Label className="text-xs">Constant value</Label>
                              <Input value={b.const_value || ""} onChange={(e)=>upsertBinding({ ...b, const_value: e.target.value })} />
                            </div>
                          )}
                          {b.source_type === "gis" && (
                            <GISBuilder value={b.expression || ""} onChange={(expr)=>upsertBinding({ ...b, expression: expr })} />
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div>
                            <Label className="text-xs">Format</Label>
                            <Input placeholder="int | float:2 | date:%Y-%m-%d" value={b.format || ""} onChange={(e)=>upsertBinding({ ...b, format: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-xs">Default</Label>
                            <Input placeholder="—" value={b.default_value || ""} onChange={(e)=>upsertBinding({ ...b, default_value: e.target.value })} />
                          </div>
                          <div className="flex items-end justify-end">
                            <Button type="button" variant="ghost" size="sm" onClick={()=>removeBinding(p.key)}><X className="h-4 w-4 mr-1"/>Remove</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {!bindings.length && (
                    <div className="text-sm text-muted-foreground p-4 text-center">No placeholders bound yet. Drag fields above.</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9 min-h-0">
          <Card className="min-h-0 flex flex-col">
            <CardHeader className="py-3"><CardTitle className="text-base">Preview</CardTitle></CardHeader>
            <CardContent className="pt-0 flex-1 min-h-0">
              <div className="flex items-center gap-2 mb-2">
                <Input placeholder="Locality Project ID" className="w-48" value={previewLocality} onChange={(e)=>setPreviewLocality(e.target.value)} />
                <Button type="button" variant="outline" size="sm" onClick={handlePreview} disabled={!previewLocality || previewing}>{previewing ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <RefreshCw className="h-4 w-4 mr-2"/>}Preview</Button>
              </div>
              <Tabs defaultValue="rendered">
                <TabsList>
                  <TabsTrigger value="rendered">Rendered</TabsTrigger>
                  <TabsTrigger value="context">Context JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="rendered">
                  <div className="border rounded p-3 h-[70vh] overflow-auto whitespace-pre-wrap">{previewRendered || "Run Preview to generate output."}</div>
                </TabsContent>
                <TabsContent value="context">
                  <pre className="max-h-[70vh] overflow-auto text-xs bg-muted/50 p-2 rounded">{JSON.stringify(previewContext, null, 2)}</pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FieldTree({ nodes, onDragStart }: { nodes: FieldNode[]; onDragStart: (n: FieldNode) => (e: React.DragEvent)=>void }) {
  return (
    <div className="space-y-2">
      {nodes.map((n) => (
        <FieldTreeNode key={n.id} node={n} depth={0} onDragStart={onDragStart} />
      ))}
    </div>
  );
}

function FieldTreeNode({ node, depth, onDragStart }: { node: FieldNode; depth: number; onDragStart: (n: FieldNode) => (e: React.DragEvent)=>void }) {
  const [open, setOpen] = useState(true);
  const isLeaf = !node.children || node.children.length === 0;
  return (
    <div>
      <div className={clsx("flex items-center justify-between rounded border p-2", isLeaf ? "bg-background" : "bg-muted/30")} draggable={isLeaf} onDragStart={isLeaf ? onDragStart(node) : undefined}>
        <div className="flex items-center gap-2 min-w-0">
          {!isLeaf && (
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={()=>setOpen((v)=>!v)}>
              <ChevronDown className={clsx("h-4 w-4 transition-transform", open ? "rotate-180" : "")} />
            </Button>
          )}
          <div className="min-w-0">
            <div className="font-medium text-sm truncate" title={String(node.label)}>{node.label}</div>
            {isLeaf && (<div className="text-[10px] text-muted-foreground">{node.type || "field"}</div>)}
          </div>
        </div>
        {isLeaf ? (<Badge variant="secondary" className="gap-1"><Database className="h-3 w-3"/>Field</Badge>) : (<Badge variant="outline">Group</Badge>)}
      </div>
      {open && node.children && node.children.length > 0 && (
        <div className="pl-3 mt-1 space-y-1">
          {node.children.map((c) => (<FieldTreeNode key={c.id} node={c} depth={depth + 1} onDragStart={onDragStart} />))}
        </div>
      )}
    </div>
  );
}

function FieldPicker({ inline, fields, value, onChange }: { inline?: boolean; fields: FieldNode[]; value: string; onChange: (v: string)=>void }) {
  const [q, setQ] = useState("");
  const leaves = useMemo(() => fields.filter((f) => !f.children || f.children.length === 0), [fields]);
  const filtered = useMemo(() => { if (!q) return leaves; const qq = q.toLowerCase(); return leaves.filter((f) => f.label.toLowerCase().includes(qq)); }, [q, leaves]);
  return (
    <div className={clsx("border rounded", inline ? "p-2" : "p-3")}> 
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-4 w-4 text-muted-foreground"/>
        <Input placeholder="Search field…" value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-auto">
        {filtered.map((f) => (
          <button type="button" key={String(f.id)} className={clsx("text-left p-2 rounded border hover:bg-muted/60", value === String(f.id) ? "ring-2 ring-primary" : "")} onClick={()=>onChange(String(f.id))} >
            <div className="font-medium text-sm truncate">{f.label}</div>
            <div className="text-[10px] text-muted-foreground">{f.type || "field"}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function bindingLabel(b: SaveBinding, fields: FieldNode[]) { if (b.source_type === "form_field") { const f = fields.find((x) => String(x.id) === String(b.form_field_id)); return f ? f.label : `Field #${b.form_field_id}`; } if (b.source_type === "constant") return `Constant: ${b.const_value ?? ""}`; if (b.source_type === "gis") return `GIS: ${b.expression ?? ""}`; if (b.source_type === "computed") return `Expr: ${b.expression ?? ""}`; return "Unbound"; }

function HelperSnippets({ onInsert }: { onInsert: (code: string) => void }) { return (<div className="flex items-center gap-2 text-xs text-muted-foreground"><span>Snippets:</span><Button type="button" variant="secondary" size="sm" onClick={()=>onInsert(" today() ")}><Sparkles className="h-3 w-3 mr-1"/>today()</Button><Button type="button" type="button" variant="secondary" size="sm" onClick={()=>onInsert(" now('%Y-%m-%d') ")}>now('%Y-%m-%d')</Button></div>); }

function GISBuilder({ value, onChange }: { value: string; onChange: (v: string)=>void }) { const [mode, setMode] = useState<string>(() => inferMode(value)); useEffect(()=>{ setMode(inferMode(value)); }, [value]); return (<div className="space-y-2"><div className="grid grid-cols-3 gap-2"><div><Label className="text-xs">Preset</Label><Select value={mode} onValueChange={(v)=>{ setMode(v); onChange(presetToExpr(v)); }}><SelectTrigger><SelectValue placeholder="Choose"/></SelectTrigger><SelectContent><SelectItem value="area_locality">Area(locality)</SelectItem><SelectItem value="area_landuse">Area by LandUse</SelectItem><SelectItem value="map_png">Static map PNG</SelectItem><SelectItem value="custom">Custom</SelectItem></SelectContent></Select></div><div className="col-span-2"><Label className="text-xs">Expression</Label><Input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={"map_png({land_use:'Agriculture', status:'Approved'}, scale=25000)"} /></div></div><p className="text-[11px] text-muted-foreground">Examples: <code>area(locality)</code>, <code>area_by_landuse('Agriculture')</code>, <code>map_png(&#123;land_use:'Agriculture'&#125;, scale=25000)</code></p></div>); }
function inferMode(expr: string) { if (!expr) return "custom"; if (expr.startsWith("area(locality")) return "area_locality"; if (expr.startsWith("area_by_landuse")) return "area_landuse"; if (expr.startsWith("map_png")) return "map_png"; return "custom"; }
function presetToExpr(mode: string) { if (mode === "area_locality") return "area(locality)"; if (mode === "area_landuse") return "area_by_landuse('Agriculture')"; if (mode === "map_png") return "map_png({land_use:'Agriculture', status:'Approved'}, scale=25000)"; return ""; }

async function buildPreviewContext(localityProjectId: string | number, bindings: SaveBinding[]) {
  const ctx: any = { header: {}, intro: {}, stats: {}, locality: localityProjectId };
  for (const b of bindings) {
    const value = await resolveBinding(b);
    setDeep(ctx, b.placeholder, value);
  }
  return ctx;
}

async function resolveBinding(b: SaveBinding) {
  if (b.source_type === "constant") return b.const_value ?? "";
  if (b.source_type === "form_field") return formatValue(MOCK_FORM_VALUES[String(b.form_field_id)], b.format, b.default_value);
  if (b.source_type === "computed") {
    if ((b.expression || "").includes("today()")) return new Date().toISOString().slice(0, 10);
    const m = /(now\(['"]([^'"]+)['"]\))/.exec(b.expression || "");
    if (m) return formatDate(new Date(), m[2]);
    return "";
  }
  if (b.source_type === "gis") {
    if ((b.expression || "").startsWith("area(locality)")) return 247.92;
    return "";
  }
  return "";
}

function setDeep(obj: any, path: string, value: any) { const parts = path.split("."); let cur = obj; for (let i = 0; i < parts.length - 1; i++) { const k = parts[i]; if (!(k in cur)) cur[k] = {}; cur = cur[k]; } cur[parts[parts.length - 1]] = value; }
function formatValue(v: any, format?: string | null, def?: string | null) { if (v == null || Number.isNaN(v)) return def ?? ""; if (!format) return v; if (format.startsWith("int")) return Math.round(Number(v)); if (format.startsWith("float")) { const p = Number(format.split(":")[1] || 2); return Number(v).toFixed(p); } if (format.startsWith("date:")) { const spec = format.slice(5); return formatDate(new Date(v), spec); } return v; }
function formatDate(d: Date, spec: string) { const pad=(n:number)=>String(n).padStart(2,"0"); return spec.replace("%Y", String(d.getFullYear())).replace("%m", pad(d.getMonth()+1)).replace("%d", pad(d.getDate())); }
function renderTemplate(tpl: string, ctx: any) { return tpl.replace(/\{\{\s*([\w\.-]+)\s*\}\}/g, (_, k) => { const v = getDeep(ctx, k); if (v === undefined || v === null) return ""; if (typeof v === "object") return JSON.stringify(v); return String(v); }); }
function getDeep(obj: any, path: string) { const parts = path.split("."); let cur = obj; for (const p of parts) { if (cur == null) return undefined; cur = cur[p]; } return cur; }
