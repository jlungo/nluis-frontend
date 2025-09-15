import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LandUseDto } from "@/queries/useSetupQuery";

type StatusKey = "Approved" | "In Review" | "Draft" | "Rejected" | "Conflict";

interface ZoneLegendProps {
  colorMode?: "type" | "status";
  landUses?: LandUseDto[];
  countsByType?: Record<number | string, number>; // key = land_use id (string or number)
  countsByStatus?: Partial<Record<StatusKey, number>>;

  // Moved LAYERS controls into legend:
  basemapVisible?: boolean;
  onToggleBasemap?: (visible: boolean) => void;

  // per-type and per-status visibility:
  visibleTypes?: Record<string, boolean>; // key = land_use id as string
  visibleStatuses?: Record<string, boolean>;
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

  visibleTypes = {},
  visibleStatuses = {},
  onToggleType,
  onToggleStatus,
}: ZoneLegendProps) {
  // Normalize type rows with correct counts
  const typeRows = landUses.map((lu) => ({
    id: lu.id,
    name: lu.name,
    color: lu.color || "#6b7280",
    description: lu.description || "",
    count: countsByType[String(lu.id)] ?? 0,
    visible: visibleTypes[String(lu.id)] ?? true,
  }));

  // Normalize status rows with correct counts
  const statuses: StatusKey[] = [
    "Approved",
    "In Review",
    "Draft",
    "Rejected",
    "Conflict",
  ];
  const statusRows = statuses.map((k) => ({
    status: k,
    ...STATUS_STYLE[k],
    count: countsByStatus[k] ?? 0,
    visible: visibleStatuses[k] ?? true,
  }));

  const headerTitle = colorMode === "type" ? "Zone Types" : "Zone Status";

  return (
    <div className="space-y-4">
      {/* Main list: Types or Status with counts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{headerTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {colorMode === "type"
            ? typeRows.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-4 h-4 rounded flex-shrink-0"
                      style={{ backgroundColor: zone.color, opacity: zone.visible ? 1 : 0.25 }}
                      title={zone.visible ? "Visible" : "Hidden"}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {zone.name}
                      </div>
                      {zone.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {zone.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {zone.count}
                  </Badge>
                </div>
              ))
            : statusRows.map((row) => (
                <div
                  key={row.status}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-4 h-4 rounded flex-shrink-0 relative"
                      style={{
                        backgroundColor: row.color,
                        opacity: row.visible ? row.opacity : 0.2,
                      }}
                      title={row.visible ? "Visible" : "Hidden"}
                    >
                      {row.status === "Conflict" && (
                        <div
                          className="absolute inset-0 bg-red-500 opacity-30"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,0.3) 1px, rgba(255,255,255,0.3) 2px)",
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {row.status}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {row.count}
                  </Badge>
                </div>
              ))}
        </CardContent>
      </Card>

      {/* LAYERS controls (moved here): basemap + per-type/per-status visibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Layers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Basemap toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Basemap</span>
            <Switch
              checked={basemapVisible}
              onCheckedChange={(v) => onToggleBasemap?.(v)}
            />
          </div>

          {/* Per-category toggles depending on mode */}
          {colorMode === "type" ? (
            <div className="space-y-2">
              {typeRows.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-sm truncate">{t.name}</span>
                  </div>
                  <Switch
                    checked={t.visible}
                    onCheckedChange={(v) => onToggleType?.(t.id, v)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {statusRows.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: s.color, opacity: s.opacity }}
                    />
                    <span className="text-sm truncate">{s.status}</span>
                  </div>
                  <Switch
                    checked={s.visible}
                    onCheckedChange={(v) => onToggleStatus?.(s.status, v)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
