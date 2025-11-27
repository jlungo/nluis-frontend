import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LandUseDto } from "@/queries/useSetupQuery";

type StatusKey = "Approved" | "In Review" | "Draft" | "Rejected" | "Conflict";

interface ZoneLegendProps {
  colorMode?: "type" | "status";
  landUses?: LandUseDto[];
  countsByType?: Record<number | string, number>;
  countsByStatus?: Partial<Record<StatusKey, number>>;
  basemapVisible?: boolean;
  onToggleBasemap?: (visible: boolean) => void;
  labelsVisible?: boolean;
  onToggleLabels?: (visible: boolean) => void;
  isProposed?: boolean;
  existingOverlay?: boolean;
  onToggleExistingOverlay?: (visible: boolean) => void;
  visibleTypes?: Record<string | number, boolean>;
  visibleStatuses?: Partial<Record<StatusKey, boolean>>;
  onToggleType?: (id: number | string, visible: boolean) => void;
  onToggleStatus?: (status: StatusKey, visible: boolean) => void;
}

const STATUS_STYLE: Record<StatusKey, { color: string; opacity: number }> = {
  Approved: { color: "#22c55e", opacity: 1.0 },
  "In Review": { color: "#f59e0b", opacity: 0.7 },
  Draft: { color: "#6b7280", opacity: 0.5 },
  Rejected: { color: "#dc2626", opacity: 0.6 },
  Conflict: { color: "#ef4444", opacity: 0.8 },
};

export function ZoneLegend({
  colorMode = "type",
  landUses = [],
  countsByType = {},
  countsByStatus = {},
  basemapVisible = true,
  onToggleBasemap,
  labelsVisible = true,
  onToggleLabels,
  isProposed = false,
  existingOverlay = false,
  onToggleExistingOverlay,
  visibleTypes = {},
  visibleStatuses = {},
  onToggleType,
  onToggleStatus,
}: ZoneLegendProps) {
  const typeRows = landUses.map((lu) => ({
    id: lu.id,
    name: lu.name,
    color: lu.color || "#6b7280",
    description: lu.description || "",
    count: countsByType[String(lu.id)] ?? 0,
  }));

  const statuses: StatusKey[] = ["Approved", "In Review", "Draft", "Rejected", "Conflict"];
  const statusRows = statuses.map((k) => ({ status: k, ...STATUS_STYLE[k], count: countsByStatus[k] ?? 0 }));

  // Filter to show only entries that exist in the current view/layers for types only
  const typeRowsFiltered = typeRows.filter((r) => (r.count ?? 0) > 0);

  return (
    <div className="space-y-4">
      {/* UNIFIED LAYERS CARD */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Layers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {/* Base layers */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Basemap</span>
            <Switch checked={basemapVisible} onCheckedChange={(v) => onToggleBasemap?.(v)} />
          </div>
          
          {isProposed && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Existing Land Use</span>
              <Switch checked={existingOverlay} onCheckedChange={(v) => onToggleExistingOverlay?.(v)} />
            </div>
          )}

          {/* Separator between base layers and zone layers */}
          <div className="border-t pt-3 space-y-3">
            {colorMode === "type" ? (
              // Zone Types with toggles
              typeRowsFiltered.length > 0 ? (
                typeRowsFiltered.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: zone.color }} />
                      <span className="text-sm truncate">{zone.name} ({zone.count})</span>
                    </div>
                    <Switch 
                      checked={visibleTypes[String(zone.id)] !== false}
                      onCheckedChange={(v) => onToggleType?.(zone.id, v)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground">No zones in view.</div>
              )
            ) : (
              // Zone Statuses with toggles
              statusRows.map((row) => (
                <div key={row.status} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 rounded shrink-0" 
                      style={{ backgroundColor: row.color, opacity: row.opacity }} 
                    />
                    <span className="text-sm truncate">{row.status} ({row.count})</span>
                  </div>
                  <Switch 
                    checked={visibleStatuses[row.status] !== false}
                    onCheckedChange={(v) => onToggleStatus?.(row.status, v)}
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Labels Card */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Labels</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">Show labels</span>
            <Switch checked={labelsVisible} onCheckedChange={(v) => onToggleLabels?.(v)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
