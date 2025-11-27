import { Card } from "@/components/ui/card";
import { useZoningStore } from "../store/useZoningStore";
import { ZoneLegend } from "../components/ZoneLegend";
import { useLandUsesQuery } from "@/queries/useSetupQuery";

export default function LeftDock({ colorMode, isProposed }: { colorMode: "type" | "status"; isProposed?: boolean }) {
  const { data: landUses = [] } = useLandUsesQuery();

  const basemapVisible = useZoningStore((s) => s.basemapVisible);
  const setBasemapVisible = useZoningStore((s) => s.setBasemapVisible);
  const countsByType = useZoningStore((s) => s.countsByType);
  const countsByStatus = useZoningStore((s) => s.countsByStatus);
  const labelsVisible = useZoningStore((s) => s.labelsVisible);
  const setLabelsVisible = useZoningStore((s) => s.setLabelsVisible);
  const existingOverlay = useZoningStore((s) => s.existingLandUseOverlay);
  const setExistingOverlay = useZoningStore((s) => s.setExistingLandUseOverlay);
  const visibleTypes = useZoningStore((s) => s.visibleTypes);
  const visibleStatuses = useZoningStore((s) => s.visibleStatuses);
  const setTypeVisibility = useZoningStore((s) => s.setTypeVisibility);
  const setStatusVisibility = useZoningStore((s) => s.setStatusVisibility);

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <Card className="p-0 overflow-hidden">
        <ZoneLegend
          colorMode={colorMode}
          landUses={landUses}
          countsByType={countsByType}
          countsByStatus={countsByStatus}
          basemapVisible={basemapVisible}
          onToggleBasemap={setBasemapVisible}
          // labels
          labelsVisible={labelsVisible}
          onToggleLabels={(v) => setLabelsVisible(v)}
          // existing overlay (only for proposed)
          isProposed={isProposed}
          existingOverlay={existingOverlay}
          onToggleExistingOverlay={setExistingOverlay}
          // layer visibility
          visibleTypes={visibleTypes}
          visibleStatuses={visibleStatuses}
          onToggleType={setTypeVisibility}
          onToggleStatus={setStatusVisibility}
        />
      </Card>
    </div>
  );
}
