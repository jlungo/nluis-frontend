import { create } from "zustand";
import type { ZoningMapAPI, LabelField } from "../types";

type StatusKey = "Approved" | "In Review" | "Draft" | "Rejected" | "Conflict";

type ZoneSummary = {
  id: string | number;
  type: string;
  color: string;
  coordinates: number[][];
  status: string;
  notes?: string;
  lastModified?: string;
};

type ZoningStore = {
  // UI
  leftDockOpen: boolean;
  rightDockOpen: boolean;
  setLeftDockOpen: (v: boolean) => void;
  setRightDockOpen: (v: boolean) => void;

  // Layers / labels
  basemapVisible: boolean;
  setBasemapVisible: (v: boolean) => void;
  labelsVisible: boolean;
  labelField: LabelField;
  setLabelsVisible: (v: boolean) => void;
  setLabelField: (f: LabelField) => void;

  // Legend counts
  countsByType: Record<string | number, number>;
  countsByStatus: Partial<Record<StatusKey, number>>;
  setCounts: (byType: Record<string | number, number>, byStatus: Partial<Record<StatusKey, number>>) => void;

  // Selection / details
  activeZoneId: string | null;
  activeZoneSummary?: ZoneSummary;
  isNewZone: boolean;
  setActiveZone: (id: string | null, summary?: ZoneSummary, isNew?: boolean) => void;

  // Conflicts for the active zone
  conflicts: Array<{ id: string | number; with: (string | number)[] }>;
  setConflicts: (list: Array<{ id: string | number; with: (string | number)[] }>) => void;

  // Status bar
  mouseLonLat?: [number, number];
  mouseUtm?: [number, number];
  zoom?: number;
  setStatusBar: (x?: [number, number], u?: [number, number], z?: number) => void;

  // Map API (registered by MapEngine)
  api: Partial<ZoningMapAPI>;
  setAPI: (api: Partial<ZoningMapAPI>) => void;
};

export const useZoningStore = create<ZoningStore>((set) => ({
  // UI
  leftDockOpen: true,
  rightDockOpen: true,
  setLeftDockOpen: (v) => set({ leftDockOpen: v }),
  setRightDockOpen: (v) => set({ rightDockOpen: v }),

  // Layers / labels
  basemapVisible: true,
  setBasemapVisible: (v) => set({ basemapVisible: v }),
  labelsVisible: true,
  labelField: "land_use_name",
  setLabelsVisible: (v) => set({ labelsVisible: v }),
  setLabelField: (f) => set({ labelField: f }),

  // Legend counts
  countsByType: {},
  countsByStatus: {},
  setCounts: (byType, byStatus) => set({ countsByType: byType, countsByStatus: byStatus }),

  // Selection / details
  activeZoneId: null,
  activeZoneSummary: undefined,
  isNewZone: false,
  setActiveZone: (id, summary, isNew) => set({ activeZoneId: id, activeZoneSummary: summary, isNewZone: !!isNew }),

  // Conflicts
  conflicts: [],
  setConflicts: (list) => set({ conflicts: list }),

  // Status bar
  mouseLonLat: undefined,
  mouseUtm: undefined,
  zoom: undefined,
  setStatusBar: (x, u, z) => set({ mouseLonLat: x, mouseUtm: u, zoom: z }),

  api: {},
  setAPI: (api) => set((s) => ({ api: { ...s.api, ...api } })),
}));
