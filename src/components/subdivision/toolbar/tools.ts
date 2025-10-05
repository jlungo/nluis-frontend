import {
  Save,
  Layers,
  Type,
  PencilRuler,
  Square,
  MousePointer2,
  Eye,
  UploadCloud,
  RotateCw,
  Ruler,
} from "lucide-react";
import useSubdivisionStore from "../store/useSubdivisionStore";
import {
  useCreateSubdivision,
  useUpdateSubdivision,
} from "@/queries/useParcelQuery";

interface ToolbarButton {
  id: string;
  label: string;
  icon: any;
  onClick: () => void;
  disabled?: boolean;
}

interface ToolbarSection {
  id: string;
  buttons: ToolbarButton[];
}

export function useToolbarDefs(): ToolbarSection[] {
  // UI state selectors
  const leftOpen = useSubdivisionStore((s) => s.leftPanelOpen);
  const setLeftOpen = useSubdivisionStore((s) => s.setLeftPanelOpen);
  const labelsVisible = useSubdivisionStore((s) => s.labelsVisible);
  const toggleLabels = useSubdivisionStore((s) => s.toggleLabels);
  const rightOpen = useSubdivisionStore((s) => s.rightPanelOpen);
  const setRightOpen = useSubdivisionStore((s) => s.setRightPanelOpen);

  // Data state
  const parentParcel = useSubdivisionStore.getState().parentParcel;
  const subdivisions = useSubdivisionStore.getState().subdivisions || [];
  const parcelId = parentParcel?.properties?.id;
  const hasSubdivisions = subdivisions.length > 0;
  const hasParent = !!parcelId;

  // Mutations
  const createMut = useCreateSubdivision({ onDone: () => {} });
  const updateMut = useUpdateSubdivision({ onDone: () => {} });

  // Helper
  const getActions = () => useSubdivisionStore.getState();

  // Save Handler
  const onSave = async () => {
    if (!parcelId) {
      window.alert("No parent parcel selected; cannot save subdivisions.");
      return;
    }

    const currentSubdivisions = useSubdivisionStore.getState().subdivisions;
    try {
      const creates = currentSubdivisions.filter((s) =>
        String(s.properties?.id || "").startsWith("temp_")
      );
      const updates = currentSubdivisions.filter(
        (s) => !String(s.properties?.id || "").startsWith("temp_")
      );

      for (const s of creates) {
        const payload = { ...s } as any;
        delete payload.properties.id;
        await createMut.mutateAsync({ parcelId, data: payload });
      }

      for (const s of updates) {
        const subdivisionId = s.properties?.id;
        if (!subdivisionId) continue;
        await updateMut.mutateAsync({ parcelId, subdivisionId, data: s });
      }

      window.alert("Save complete");
    } catch (e) {
      console.error("Error saving subdivisions:", e);
      window.alert("Error saving subdivisions; see console");
    }
  };

  // Toolbar sections
  return [
    // 🗂 Main actions
    {
      id: "main",
      buttons: [
        {
          id: "save",
          label: "Save",
          icon: Save,
          onClick: onSave,
          disabled: !hasParent || !hasSubdivisions,
        },
        {
          id: "upload",
          label: "Upload Plan",
          icon: UploadCloud,
          onClick: () => {
            const actions = getActions();
            actions.setLandUsePlan?.({
              name: "placeholder",
              uploadedAt: Date.now(),
            });
            window.alert("Plan set (placeholder)");
          },
        },
      ],
    },

    // 🌍 Layers & Labels
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
          onClick: () => toggleLabels(),
        },
      ],
    },

    // ✏️ Draw Tools
    {
      id: "draw",
      buttons: [
        {
          id: "select",
          label: "Select",
          icon: MousePointer2,
          onClick: () => {
            const state = useSubdivisionStore.getState();
            const api = state.api;
            if (api) {
              api.startSelect?.();
            }
            state.setInteractionMode("select");
            state.setIsDrawing(false);
            state.setSelectedId(null);
          },
        },
        {
          id: "draw-polygon",
          label: "Draw Polygon",
          icon: Square,
          onClick: () => {
            const state = useSubdivisionStore.getState();
            const api = state.api;
            if (api) {
              api.startDrawPolygon?.();
            }
          },
        },
        {
          id: "draw-line",
          label: "Draw Line",
          icon: PencilRuler,
          onClick: () => {
            const state = useSubdivisionStore.getState();
            const api = state.api;
            if (api) {
              api.startDrawLine?.();
            }
          },
        },
        {
          id: "add-points",
          label: "Add Points",
          icon: PencilRuler,
          onClick: () => {
            const state = useSubdivisionStore.getState();
            const api = state.api;
            if (api) {
              api.openAddPoints?.();
            }
          },
        },
      ],
    },

    // 📏 Measurement Tools
    {
      id: "measure",
      buttons: [
        {
          id: "measure-distance",
          label: "Measure Distance",
          icon: Ruler,
          onClick: () => {
            const state = useSubdivisionStore.getState();
            state.setInteractionMode("measure");
            state.setDrawMode("line");
            state.setIsDrawing(true);
            const api = state.api;
            if (api) {
              api.startDrawLine?.();
            }
          },
        },
        {
          id: "measure-area",
          label: "Measure Area",
          icon: Square,
          onClick: () => {
            const state = useSubdivisionStore.getState();
            state.setInteractionMode("measure");
            state.setDrawMode("polygon");
            state.setIsDrawing(true);
            const api = state.api;
            if (api) {
              api.startDrawPolygon?.();
            }
          },
        },
      ],
    },

    // 👁 View / Navigation
    {
      id: "view",
      buttons: [
        {
          id: "toggle-right",
          label: rightOpen ? "Hide Inspector" : "Show Inspector",
          icon: Eye,
          onClick: () => setRightOpen(!rightOpen),
        },
        {
          id: "reset-view",
          label: "Reset View",
          icon: RotateCw,
          onClick: () => {
            const map = getActions().map;
            map?.flyTo({
              center: [35.7516, -6.3690],
              zoom: 5.8,
              duration: 1000,
            });
          },
        },
      ],
    },
  ];
}
