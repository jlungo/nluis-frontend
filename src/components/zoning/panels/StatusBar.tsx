import { useZoningStore } from "../store/useZoningStore";

export default function StatusBar() {
  const lonlat = useZoningStore((s) => s.mouseLonLat);
  const utm = useZoningStore((s) => s.mouseUtm);
  const zoom = useZoningStore((s) => s.zoom);

  return (
    <div className="h-7 border-t bg-background/95 px-3 text-xs flex items-center gap-4">
      <div>CRS: Render EPSG:3857 / Readout EPSG:4326 & 32737</div>
      <div className="text-muted-foreground">Zoom: {zoom?.toFixed?.(2) ?? "-"}</div>
      <div>Lon/Lat: {lonlat ? `${lonlat[0].toFixed(6)}, ${lonlat[1].toFixed(6)}` : "-"}</div>
      <div>UTM 37S: {utm ? `${utm[0].toFixed(2)} E, ${utm[1].toFixed(2)} N` : "-"}</div>
    </div>
  );
}
