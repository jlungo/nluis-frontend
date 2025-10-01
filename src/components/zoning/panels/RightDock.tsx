import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { useZoningStore } from "../store/useZoningStore";
import { ZoneDetailsPanel } from "../components/ZoneDetailsPanel";
import { useLandUsesQuery } from "@/queries/useSetupQuery";
import { getOuterRing } from "../utils/geo";
import { ConflictsPanel } from "../components/ConflictsPanel";
import { HistoryPanel } from "../components/HistoryPanel";

export default function RightDock() {
  const [tab, setTab] = useState("details");

  const activeZoneId = useZoningStore((s) => s.activeZoneId);
  const activeSummary = useZoningStore((s) => s.activeZoneSummary);
  const isNew = useZoningStore((s) => s.isNewZone);
  const conflicts = useZoningStore((s) => s.conflicts);

  const api = useZoningStore((s) => s.api);
  const { data: landUses = [] } = useLandUsesQuery();

  const zones = useMemo(() => {
    return activeSummary
      ? [{
        id: activeSummary.id,
        type: activeSummary.type,
        color: activeSummary.color || "#888",
        coordinates: getOuterRing({ type: "Polygon", coordinates: [activeSummary.coordinates] }),
        status: activeSummary.status || "Draft",
        attributes: {},
        notes: activeSummary.notes || "",
        lastModified: activeSummary.lastModified,
      }]
      : [];
  }, [activeSummary]);

  // Match LeftDock: make the container the scroller
  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="p-0">
          <ZoneDetailsPanel
            activeZone={activeZoneId}
            zones={zones}
            onUpdateZone={() => api.saveToAPI?.()}
            landUses={landUses}
            isNewZone={isNew}
            onAssignLandUse={(_zoneId, lu) => api.assignLandUseToActive?.(lu.id)}
            onApprove={() => api.approve?.()}
            onReject={() => api.reject?.()}
            onDelete={() => api.deleteZone?.()}
            onEnterEdit={() => api.editSelectedFeatures?.()}
          />
        </TabsContent>

        <TabsContent value="conflicts" className="p-0">
          <ConflictsPanel
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            conflicts={conflicts as any}
            zones={[]}
          />
        </TabsContent>

        <TabsContent value="history" className="p-0">
          <HistoryPanel zones={[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
