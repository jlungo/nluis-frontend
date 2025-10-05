// store/subdivisionStore.ts
import { create } from 'zustand';
import { persist } from './persistence';
import type { Map as MapboxMap } from 'mapbox-gl';
import type { 
  ParcelFeature, 
  SubdivisionFeature, 
  PartyInfo, 
  ValidationError 
} from '@/types/subdivision';
import type { SubdivisionState, SubdivisionActions } from './types';

type Store = SubdivisionState & SubdivisionActions;

const initialState: SubdivisionState = {
  // Map state
  map: null,
  api: undefined,
  styleName: 'streets-v12',
  labelsVisible: true,
  labelField: 'name',

  // Data
  parentParcel: null,
  subdivisions: [],
  plans: [],
  parties: [],
  validationErrors: [],
  landUsePlan: null,

  // Selections
  selectedId: null,
  activePlanId: null,
  inspectorOpen: false,

  // UI state
  isDrawing: false,
  drawMode: null,
  interactionMode: null,
  leftPanelOpen: true,
  rightPanelOpen: true,

  // Layers & visual settings
  showPlans: true,
  showParcels: true,
  parcelOpacity: 0.9,
  boundaryGlow: false,

  // Measurements
  lastMeasurement: null,
};

const useSubdivisionStore = create<Store>()(
  persist((set, get) => ({
    ...initialState,

    /* =======================
     * MAP / API
     * ======================= */
    setMap: (map: MapboxMap | null) => {
      if (get().map !== map) set({ map });
    },

    getMap: () => get().map,

    setAPI: (api: any) => {
      if (get().api !== api) set({ api });
    },

    setStyleName: (style: string) => {
      if (get().styleName !== style) set({ styleName: style });
    },

    /* =======================
     * LABELS
     * ======================= */
    setLabelField: (field: string) => {
      if (get().labelField !== field) set({ labelField: field });
    },

    setLabelsVisible: (visible: boolean) => {
      if (get().labelsVisible !== visible) set({ labelsVisible: visible });
    },

    toggleLabels: () => set((state) => ({ labelsVisible: !state.labelsVisible })),

    /* =======================
     * PARCELS / SUBDIVISIONS
     * ======================= */
    setParentParcel: (parcel: ParcelFeature | null) => {
      if (get().parentParcel !== parcel) set({ parentParcel: parcel });
    },

    addSubdivision: (sub: SubdivisionFeature) =>
      set((state) => ({ subdivisions: [...state.subdivisions, sub] })),

    updateSubdivision: (id: string, updates: Partial<SubdivisionFeature>) =>
      set((state) => ({
        subdivisions: state.subdivisions.map((sub) =>
          sub.properties?.id === id ? { ...sub, ...updates } : sub
        ),
      })),

    deleteSubdivision: (id: string) =>
      set((state) => ({
        subdivisions: state.subdivisions.filter((s) => s.properties?.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      })),

    updateSubdivisions: (fn: (subs: SubdivisionFeature[]) => SubdivisionFeature[]) =>
      set((state) => ({ subdivisions: fn(state.subdivisions) })),

    setSelectedId: (id: string | null) => {
      if (get().selectedId !== id) set({ selectedId: id });
    },

    /* =======================
     * PLANS
     * ======================= */
    setPlans: (plans) => set({ plans }),

    togglePlan: (id) =>
      set((state) => ({
        plans: state.plans.map((plan) =>
          plan.id === id ? { ...plan, selected: !plan.selected } : plan
        ),
      })),

    selectAll: () =>
      set((state) => ({
        plans: state.plans.map((z) => ({ ...z, selected: true })),
      })),

    deselectAll: () =>
      set((state) => ({
        plans: state.plans.map((z) => ({ ...z, selected: false })),
      })),

    setActivePlan: (id: string | null) => {
      if (get().activePlanId !== id) set({ activePlanId: id });
    },

    /* =======================
     * UI CONTROLS
     * ======================= */
    setIsDrawing: (drawing: boolean) => {
      if (get().isDrawing !== drawing) set({ isDrawing: drawing });
    },

    setDrawMode: (mode) => {
      if (get().drawMode !== mode) set({ drawMode: mode });
    },

    setInteractionMode: (mode) => {
      if (get().interactionMode !== mode) set({ interactionMode: mode });
    },

    setLeftPanelOpen: (open: boolean) => {
      if (get().leftPanelOpen !== open) set({ leftPanelOpen: open });
    },

    setRightPanelOpen: (open: boolean) => {
      if (get().rightPanelOpen !== open) set({ rightPanelOpen: open });
    },

    setInspectorOpen: (open: boolean) => {
      if (get().inspectorOpen !== open) set({ inspectorOpen: open });
    },

    /* =======================
     * LAYER / VISUAL SETTINGS
     * ======================= */
    setShowPlans: (v: boolean) => {
      if (get().showPlans !== v) set({ showPlans: v });
    },

    setShowParcels: (v: boolean) => {
      if (get().showParcels !== v) set({ showParcels: v });
    },

    setParcelOpacity: (n: number) => {
      if (get().parcelOpacity !== n) set({ parcelOpacity: n });
    },

    setBoundaryGlow: (b: boolean) => {
      if (get().boundaryGlow !== b) set({ boundaryGlow: b });
    },

    /* =======================
     * VALIDATION / ERRORS
     * ======================= */
    setValidationErrors: (errors: ValidationError[]) =>
      set({ validationErrors: errors }),

    clearValidationErrors: () => set({ validationErrors: [] }),

    /* =======================
     * PARTIES / OWNERS
     * ======================= */
    addParty: (party: PartyInfo) =>
      set((state) => ({ parties: [...state.parties, party] })),

    updateParty: (id: string, updates: Partial<PartyInfo>) =>
      set((state) => ({
        parties: state.parties.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),

    deleteParty: (id: string) =>
      set((state) => ({
        parties: state.parties.filter((p) => p.id !== id),
      })),

    /* =======================
     * LAND USE PLAN
     * ======================= */
    setLandUsePlan: (plan: any) => {
      if (get().landUsePlan !== plan) set({ landUsePlan: plan });
    },

    /* =======================
     * MEASUREMENTS
     * ======================= */
    setLastMeasurement: (m) => {
      if (get().lastMeasurement !== m) set({ lastMeasurement: m });
    },

    /* =======================
     * DIALOG STATES
     * ======================= */
    setPointsDialogOpen: (open: boolean) => {
      if (!open) {
        set({
          drawMode: null,
          isDrawing: false,
          interactionMode: 'select',
        });
      } else {
        set({ drawMode: 'point', isDrawing: true });
      }
    },
  }))
);

export default useSubdivisionStore;
