import { useZoningStore } from "../store/useZoningStore";
import { LabelField } from "../types";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Palette, Maximize, Minimize } from "lucide-react";

/* ---------- small menu primitives ---------- */
function MenuButton({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" className={`px-2 py-1 text-sm hover:bg-muted rounded ${open ? "bg-muted" : ""}`} onClick={() => setOpen((v) => !v)}>
        {label}
      </button>
      {open && <div className="absolute z-50 mt-1 w-64 rounded border bg-popover p-1 shadow">{children}</div>}
    </div>
  );
}
function Item({ onClick, children, disabled }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-muted ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Sep() { return <div className="my-1 h-px bg-border" />; }

/* -------------- main menubar -------------- */
export default function MenuBar({
  colorMode,
  onColorModeChange,
  isMaximized,
  onToggleMaximize,
}: {
  colorMode: "type" | "status";
  onColorModeChange: (m: "type" | "status") => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}) {
  const api = useZoningStore((s) => s.api);
  const leftOpen = useZoningStore((s) => s.leftDockOpen);
  const rightOpen = useZoningStore((s) => s.rightDockOpen);
  const setLeftOpen = useZoningStore((s) => s.setLeftDockOpen);
  const setRightOpen = useZoningStore((s) => s.setRightDockOpen);

  const labelsVisible = useZoningStore((s) => s.labelsVisible);
  const setLabelsVisible = useZoningStore((s) => s.setLabelsVisible);
  const setLabelField = useZoningStore((s) => s.setLabelField);

  const selectedIds: (string | number)[] = useMemo(
    () => api.getSelectedIds?.() ?? [],
    [api]
  );
  const hasSelection = selectedIds.length > 0;

  const setField = (f: LabelField) => { setLabelField(f); api.setLabelField?.(f); };

  return (
    <div className="flex items-center gap-2 px-2 border-b bg-background/95">
      <MenuButton label="Project">
        <Group label="Save">
          <Item onClick={() => api.saveToAPI?.()}>Save (API)</Item>
          <Item onClick={() => api.saveAsGeoJSON?.()}>Save As… GeoJSON</Item>
          <Item onClick={() => api.saveAsShapefile?.()}>Save As… Shapefile (.zip)</Item>
        </Group>
      </MenuButton>

      <MenuButton label="View">
        <Group label="Panels">
          <Item onClick={() => setLeftOpen(!leftOpen)}>{leftOpen ? "Hide" : "Show"} Left Panels</Item>
          <Item onClick={() => setRightOpen(!rightOpen)}>{rightOpen ? "Hide" : "Show"} Right Panels</Item>
        </Group>
        <Sep />
        <Group label="Labels">
          <Item onClick={() => { setLabelsVisible(!labelsVisible); api.toggleLabels?.(!labelsVisible); }}>
            {labelsVisible ? "Hide Labels" : "Show Labels"}
          </Item>
          <Item onClick={() => setField("land_use_name")}>Field: Land Use Name</Item>
          <Item onClick={() => setField("land_use")}>Field: Land Use (id)</Item>
          <Item onClick={() => setField("id")}>Field: Zone ID</Item>
          <Item onClick={() => setField("none")}>Field: None</Item>
        </Group>
      </MenuButton>

      <MenuButton label="Layer">
        <Group label="Add Layer">
          <Item onClick={() => api.openDelimitedText?.()}>Delimited Text (CSV)…</Item>
          <Item onClick={() => api.openVectorGeoJSON?.()}>Vector (GeoJSON)…</Item>
          <Item onClick={() => api.openShapefileZip?.()}>Shapefile (.zip)…</Item>
          <Item onClick={() => api.openWebTiles?.()}>Web (XYZ/WMTS)…</Item>
        </Group>
        <Group label="Draw Layer">
          <Item onClick={() => api.startDrawPoint?.()}>Point</Item>
          <Item onClick={() => api.startDrawLine?.()}>Line</Item>
          <Item onClick={() => api.startDrawPolygon?.()}>Polygon</Item>
        </Group>
      </MenuButton>

      {/* NEW: Edit menu with approvals */}
      <MenuButton label="Edit">
        <Group label="Selection">
          <Item onClick={() => api.editSelectedFeatures?.()} disabled={!hasSelection}>
            Edit Selected
          </Item>
          <Item onClick={() => api.approveSelected?.()} disabled={!hasSelection}>
            Approve Selected
          </Item>
          <Item onClick={() => api.rejectSelected?.()} disabled={!hasSelection}>
            Reject Selected
          </Item>
          <Item onClick={() => api.sendToDraftSelected?.()} disabled={!hasSelection}>
            Send to Draft
          </Item>
        </Group>
      </MenuButton>

      <MenuButton label="Draw">
        <Item onClick={() => api.startDrawPolygon?.()}>Polygon</Item>
        <Item onClick={() => api.openAddPoints?.()}>Points → Polygon</Item>
      </MenuButton>

      <div className="flex-1" />

      {/* Color mode + Fullscreen toggle */}
      <div className="flex items-center gap-3">
        <Palette className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Type</span>
        <Switch
          checked={colorMode === "status"}
          onCheckedChange={(c) => onColorModeChange(c ? "status" : "type")}
        />
        <span className="text-sm text-muted-foreground">Status</span>

        {onToggleMaximize && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleMaximize}
            className="h-8 px-2 ml-2"
            title={isMaximized ? "Exit full screen" : "Full screen"}
          >
            {isMaximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
