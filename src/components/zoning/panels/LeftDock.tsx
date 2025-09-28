import { Card } from "@/components/ui/card";
import { useZoningStore } from "../store/useZoningStore";
import { ZoneLegend } from "../components/ZoneLegend";
import { useLandUsesQuery } from "@/queries/useSetupQuery";

export default function LeftDock({ colorMode }: { colorMode: "type" | "status" }) {
  const { data: landUses = [] } = useLandUsesQuery();

  const basemapVisible = useZoningStore((s) => s.basemapVisible);
  const setBasemapVisible = useZoningStore((s) => s.setBasemapVisible);
  const countsByType = useZoningStore((s) => s.countsByType);
  const countsByStatus = useZoningStore((s) => s.countsByStatus);
  const labelsVisible = useZoningStore((s) => s.labelsVisible);
  const setLabelsVisible = useZoningStore((s) => s.setLabelsVisible);

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
        />
      </Card>
    </div>
  );
}
