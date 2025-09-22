import { Badge } from "@/components/ui/badge";
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
  visibleTypes?: Record<string, boolean>;
  visibleStatuses?: Record<string, boolean>;
  onToggleType?: (id: number | string, visible: boolean) => void;
  onToggleStatus?: (status: StatusKey, visible: boolean) => void;

  // NEW:
  labelsVisible?: boolean;
  onToggleLabels?: (visible: boolean) => void;
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

  const headerTitle = colorMode === "type" ? "Zone Types" : "Zone Status";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">{headerTitle}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {colorMode === "type"
            ? (typeRowsFiltered.length
                ? typeRowsFiltered
                : [])
                .map((zone) => (
                <div key={zone.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: zone.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{zone.name}</div>
                      {zone.description && <div className="text-xs text-muted-foreground truncate">{zone.description}</div>}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">{zone.count}</Badge>
                </div>
              ))
            : statusRows.map((row) => (
                <div key={row.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: row.color, opacity: row.opacity }} />
                    <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{row.status}</div></div>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">{row.count}</Badge>
                </div>
              ))}
          {(colorMode === "type" && typeRowsFiltered.length === 0) && (
            <div className="text-xs text-muted-foreground">No land uses in view.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Layers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Basemap</span>
            <Switch checked={basemapVisible} onCheckedChange={(v) => onToggleBasemap?.(v)} />
          </div>
        </CardContent>
      </Card>

      {/* NEW: Labels */}
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
