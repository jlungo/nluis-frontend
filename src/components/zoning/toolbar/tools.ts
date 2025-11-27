import { Save, Layers, Type, Eye, MousePointer2, Circle, Slash, Triangle } from "lucide-react";
import { useZoningStore } from "../store/useZoningStore";

export function useToolbarDefs() {
  const api = useZoningStore((s) => s.api);
  const leftOpen = useZoningStore((s) => s.leftDockOpen);
  const setLeftOpen = useZoningStore((s) => s.setLeftDockOpen);
  const labelsVisible = useZoningStore((s) => s.labelsVisible);
  const setLabelsVisible = useZoningStore((s) => s.setLabelsVisible);
  const rightOpen = useZoningStore((s) => s.rightDockOpen);
  const setRightOpen = useZoningStore((s) => s.setRightDockOpen);

  return [
    {
      id: "main",
      buttons: [
        {
          id: "save",
          label: "Save",
          icon: Save,
          onClick: () => api.saveToAPI?.(),
        },
      ],
    },
    {
      id: "layers",
      buttons: [
        {
          id: "toggle-left",
          label: leftOpen ? "Hide Layers" : "Show Layers",
          icon: Layers,
          onClick: () => setLeftOpen(!leftOpen),
        },
        {
          id: "labels",
          label: labelsVisible ? "Hide Labels" : "Show Labels",
          icon: Type,
          onClick: () => {
            setLabelsVisible(!labelsVisible);
            api.toggleLabels?.(!labelsVisible);
          },
        },
      ],
    },
    {
      id: "draw",
      buttons: [
        {
          id: "select",
          label: "Select",
          icon: MousePointer2,
          onClick: () => api.startSelect?.(),
        },
        {
          id: "draw-point",
          label: "Draw Point",
          icon: Circle,
          onClick: () => api.startDrawPoint?.(),
        },
        {
          id: "draw-line",
          label: "Draw Line",
          icon: Slash,
          onClick: () => api.startDrawLine?.(),
        },
        {
          id: "draw-polygon",
          label: "Draw Polygon",
          icon: Triangle,
          onClick: () => api.startDrawPolygon?.(),
        },
      ],
    },
    {
      id: "view",
      buttons: [
        {
          id: "toggle-right",
          label: rightOpen ? "Hide Inspector" : "Show Inspector",
          icon: Eye,
          onClick: () => setRightOpen(!rightOpen),
        },
      ],
    },
  ];
}
