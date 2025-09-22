import { Save, Layers, Type, PencilRuler, Eye , Square, MousePointer2 } from "lucide-react";
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
          id: "add-points",
          label: "Add Points",
          icon: PencilRuler,
          onClick: () => api.openAddPoints?.(),
        },
        {
          id: "draw-poly",
          label: "Draw Polygon",
          icon: Square,
          onClick: () => api.startDrawPolygon?.(),
        }, // <-- add
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
