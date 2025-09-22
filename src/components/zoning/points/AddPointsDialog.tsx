import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";
import proj4 from "proj4";

export type CoordMode = "wgs84" | "projected";
export type PointRow = { order: number | ""; a: number | ""; b: number | "" };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (rows: PointRow[], mode: CoordMode, epsg?: string) => void;
};

export default function AddPointsDialog({ open, onOpenChange, onConfirm }: Props) {
  const [coordMode, setCoordMode] = useState<CoordMode>("wgs84");
  const [epsgCode, setEpsgCode] = useState<string>("EPSG:32737");
  const [pointRows, setPointRows] = useState<PointRow[]>([{ order: 1, a: "", b: "" }]);

  // CSV → rows
  const parseCsv = useCallback(async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const out: PointRow[] = [];
    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split(/,|;|\t/).map((c) => c.trim());
      if (cols.length < 3) continue;
      // skip header (order,lat,lon / order,easting,northing)
      if (
        i === 0 &&
        (/order/i.test(cols[0]) ||
          /lat|y|north/i.test(cols[1]) ||
          /lon|x|east/i.test(cols[2]))
      ) { continue; }
      const [ord, c1, c2] = cols;
      const order = Number(ord); const a = Number(c1); const b = Number(c2);
      if ([order, a, b].every((n) => Number.isFinite(n))) out.push({ order, a, b });
    }
    if (!out.length) { toast.error("CSV not recognized. Expect 3 columns: order, coordinate A, coordinate B."); return; }
    setPointRows(out);
    toast.success(`Loaded ${out.length} point(s) from CSV`);
  }, []);

  const addRow = () => setPointRows((r) => [...r, { order: (Number(r[r.length - 1]?.order) || r.length) + 1, a: "", b: "" }]);
  const updateRow = (idx: number, field: keyof PointRow, value: string) =>
    setPointRows((rows) => {
      const copy = [...rows];
      const val = value.trim() === "" ? "" : field === "order" ? Number(value) : Number(value);
      copy[idx] = { ...copy[idx], [field]: val as any };
      return copy;
    });
  const removeRow = (idx: number) => setPointRows((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== idx)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Points (Table / CSV)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Coordinate system */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Coordinate System</Label>
              <div className="flex gap-2 flex-wrap">
                <Button type="button" variant={coordMode === "wgs84" ? "default" : "outline"} size="sm" onClick={() => setCoordMode("wgs84")}>
                  Lat/Lon (EPSG:4326)
                </Button>
                <Button type="button" variant={coordMode === "projected" ? "default" : "outline"} size="sm" onClick={() => setCoordMode("projected")}>
                  Easting/Northing (EPSG)
                </Button>
              </div>
            </div>

            {coordMode === "projected" && (
              <div className="space-y-2">
                <Label htmlFor="epsg">EPSG Code</Label>
                <Input id="epsg" placeholder="e.g. EPSG:32737" value={epsgCode} onChange={(e) => setEpsgCode(e.target.value)} />
                <p className="text-xs text-muted-foreground">Provide the source CRS of your easting/northing.</p>
              </div>
            )}
          </div>

          {/* CSV uploader */}
          <div className="space-y-2">
            <Label>Upload CSV (3 columns)</Label>
            <div className="flex items-center gap-2">
              <Input type="file" accept=".csv,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseCsv(f); }} />
              <UploadIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Expected columns: <strong>order</strong>, <strong>{coordMode === "wgs84" ? "lat" : "easting"}</strong>, <strong>{coordMode === "wgs84" ? "lon" : "northing"}</strong>.
            </p>
          </div>

          {/* Editable table */}
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left p-2 w-24">Order</th>
                  <th className="text-left p-2">{coordMode === "wgs84" ? "Lat" : "Easting"}</th>
                  <th className="text-left p-2">{coordMode === "wgs84" ? "Lon" : "Northing"}</th>
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody>
                {pointRows.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">
                      <Input inputMode="numeric" value={row.order} onChange={(e) => updateRow(i, "order", e.target.value)} />
                    </td>
                    <td className="p-2">
                      <Input inputMode="decimal" value={row.a} onChange={(e) => updateRow(i, "a", e.target.value)} />
                    </td>
                    <td className="p-2">
                      <Input inputMode="decimal" value={row.b} onChange={(e) => updateRow(i, "b", e.target.value)} />
                    </td>
                    <td className="p-2 text-right">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(i)} disabled={pointRows.length <= 1}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={addRow}>+ Add Row</Button>
            <div className="text-xs text-muted-foreground">Minimum 3 points. Rows are sorted by <em>Order</em>.</div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={() => onConfirm(pointRows, coordMode, coordMode === "projected" ? epsgCode : undefined)}>
            Convert to Polygon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Ensure common EPSG if proj4 lacks it
proj4.defs("EPSG:32737", "+proj=utm +zone=37 +south +datum=WGS84 +units=m +no_defs +type=crs");
