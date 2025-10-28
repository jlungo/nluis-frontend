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
  selectedZoneIds: new Set<string | number>(), // Set of rendered feature ids that are selected

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
  plansOpacity: 0.45,
  boundaryGlow: false,
  colorMode: 'type',

  // Measurements
  lastMeasurement: null,
  // Dialogs
  pointsDialogOpen: false,
};

const useSubdivisionStore = create<Store>()(
  persist((set, get) => ({
    ...initialState,
    // Helper: map feature id should match vector-tile id type (numeric vs string)
    // Store keeps selection keys as strings for stability, but Mapbox expects
    // the original id type. Convert digit-only strings back to numbers.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _toMapId: (fid: any) => {
      try {
        if (typeof fid === 'number') return fid;
        if (typeof fid === 'string') {
          const n = Number(fid);
          if (Number.isFinite(n) && String(n) === fid) return n;
        }
      } catch {}
      return fid;
    },

    /* =======================
     * MAP / API
     * ======================= */
    setMap: (map: MapboxMap | null) => {
      if (get().map !== map) {
        set({ map });
        // When map becomes available, reapply selection to ensure visual state matches store
        try {
          if (map) {
            // small timeout to allow layers/sources to initialize
            setTimeout(() => {
              try { (get() as any).applySelectionToMap(); } catch {}
            }, 50);
          }
        } catch {}
      }
    },

    getMap: () => get().map,

    setAPI: (api: any) => {
      const prev = get().api || {};
      // Merge to avoid blowing away existing API methods, like zoning store
      set({ api: { ...prev, ...(api || {}) } });
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

    togglePlan: (id) => {
      const state = get();
      const plan = state.plans.find(p => String(p.id) === String(id));
      if (!plan) return;
      // Only flip plan selection flag. Zone selection syncing is handled in the UI effect
      // to avoid double updates and flicker.
      set({
        plans: state.plans.map((p) =>
          p.id === id ? { ...p, selected: !p.selected } : p
        ),
      });
    },

    selectAll: () => {
      const state = get();
      // Mark all plans selected; zone-level updates handled by panel sync effect
      set({ plans: state.plans.map((z) => ({ ...z, selected: true })) });
    },

    deselectAll: () => {
      const state = get();
      // Mark all plans deselected; panel sync effect will clear zone selection and feature-state
      set({ plans: state.plans.map((z) => ({ ...z, selected: false })) });
    },

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

    setPlansOpacity: (n: number) => {
      if (get().plansOpacity !== n) set({ plansOpacity: n });
    },

    setBoundaryGlow: (b: boolean) => {
      if (get().boundaryGlow !== b) set({ boundaryGlow: b });
    },

    setColorMode: (m: 'type' | 'status') => {
      if ((get().colorMode || 'type') !== m) set({ colorMode: m });
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
     * ZONE SELECTION
     * ======================= */
    selectZone: (fid: string | number) => {
      const next = new Set(get().selectedZoneIds);
      next.add(String(fid));
      set({ selectedZoneIds: next });

      // Persist and sync immediately
      try { (get() as any).applySelectionToMap(); } catch {}

      // Update map feature state
      try {
        const map = get().map;
        if (!map) {
          return;
        }
        const source = map.getSource('plans-tiles');
        if (!source) {
          return;
        }
        const layer = map.getLayer('plans-fill');
        if (!layer) {
          return;
        }
        const mapId = (get() as any)._toMapId(fid);
        map.setFeatureState(
          { source: 'plans-tiles', sourceLayer: 'zones', id: mapId },
          { selected: true }
        );
      } catch (err) {
        // swallow
      }
    },

    deselectZone: (fid: string | number) => {
      const next = new Set(get().selectedZoneIds);
      next.delete(String(fid));
      set({ selectedZoneIds: next });

      // Persist and sync
      try { (get() as any).applySelectionToMap(); } catch {}

      // Update map feature state
      try {
        const map = get().map;
        if (!map) {
          return;
        }
        const source = map.getSource('plans-tiles');
        if (!source) {
          return;
        }
        const mapId = (get() as any)._toMapId(fid);
        map.setFeatureState(
          { source: 'plans-tiles', sourceLayer: 'zones', id: mapId },
          { selected: false }
        );
      } catch (err) {
        // swallow
      }
    },

    clearZoneSelection: () => {
      const prev = get().selectedZoneIds;
      set({ selectedZoneIds: new Set() });
      // Clear map feature state for all previously selected zones
      try {
        const map = get().map;
        if (map) {
          Array.from(prev).forEach(fid => {
            const mapId = (get() as any)._toMapId(fid);
            map.setFeatureState(
              { source: 'plans-tiles', sourceLayer: 'zones', id: mapId },
              { selected: false }
            );
          });
        }
      } catch {}
      try { (get() as any).applySelectionToMap(); } catch {}
    },

    setFeatureStateById: (fid: string | number | { id: string | number; sourceLayer?: string }, state: Record<string, any>) => {
      try {
        const map = get().map;
        if (map) {
          // Support passing through the sourceLayer when caller knows it
          let idVal: any = fid as any;
          let sourceLayer = 'zones';
          if (typeof fid === 'object' && fid !== null && 'id' in fid) {
            const obj = fid as any;
            idVal = obj.id;
            if (obj.sourceLayer) sourceLayer = obj.sourceLayer;
          }
          const mapId = (get() as any)._toMapId(idVal);
          const tryLayers = (sl?: string) => {
            const layers = sl ? [sl] : ['zones', 'zone_snapshots'];
            for (const L of layers) {
              try { map.setFeatureState({ source: 'plans-tiles', sourceLayer: L, id: mapId }, state); } catch {}
            }
          };
          tryLayers(sourceLayer);
        }
      } catch {}
    },

    // Apply the current selection set to the map, clearing previous applied states
    applySelectionToMap: () => {
      try {
        const map = get().map as any;
        if (!map) return;

        const toMapId = (fid: any) => {
          if (typeof fid === 'number') return fid;
          if (typeof fid === 'string') { const n = Number(fid); if (Number.isFinite(n) && String(n) === fid) return n; }
          return fid;
        };

        // Previously applied selection snapshot
        const prevApplied: Set<string> = (get() as any).__appliedSelected || new Set<string>();
        const curr: Set<string> = new Set<string>(Array.from(get().selectedZoneIds || []).map(String));

        // Clear any previously applied feature-state that's no longer selected
        prevApplied.forEach((fid) => {
          if (!curr.has(fid)) {
            ['zones', 'zone_snapshots'].forEach((layer) => {
              try { map.setFeatureState({ source: 'plans-tiles', sourceLayer: layer, id: toMapId(fid) }, { selected: false }); } catch {}
            });
          }
        });

        // Apply current selected feature-state
        curr.forEach((fid) => {
          ['zones', 'zone_snapshots'].forEach((layer) => {
            try { map.setFeatureState({ source: 'plans-tiles', sourceLayer: layer, id: toMapId(fid) }, { selected: true }); } catch {}
          });
        });

        // Save snapshot
        (get() as any).__appliedSelected = curr;
      } catch {}
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
          pointsDialogOpen: false,
          drawMode: null,
          isDrawing: false,
          interactionMode: 'select',
        });
      } else {
        set({ pointsDialogOpen: true, drawMode: 'point', isDrawing: true });
      }
    },
  }))
);

export default useSubdivisionStore;
