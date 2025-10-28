import type { Map as MapboxMap } from 'mapbox-gl';
import type {
  ParcelFeature,
  SubdivisionFeature,
  PartyInfo,
  ValidationError,
} from '@/types/subdivision';

// Types and interfaces
export type PlanSummary = {
  id: string;
  name: string;
  color?: string;
  info?: string;
  selected?: boolean;
  count?: number;
};

export type LandUsePlan = {
  name: string;
  uploadedAt: number;
};

export interface SubdivisionState {
  // Map state
  map: MapboxMap | null;
  styleName: string;
  labelsVisible: boolean;
  labelField: string;
  api?: Record<string, any>;

  // Parent parcel being subdivided
  parentParcel: ParcelFeature | null;

  // List of subdivisions
  subdivisions: SubdivisionFeature[];

  // Currently selected subdivision
  selectedId: string | null;

  // UI state
  isDrawing: boolean;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  drawMode: 'polygon' | 'line' | 'point' | null;

  // Plans / layer controls
  plans: PlanSummary[];
  showPlans: boolean;
  showParcels: boolean;
  parcelOpacity: number;
  plansOpacity: number;
  boundaryGlow: boolean;
  // Coloring strategy (similar to zoning): by land-use type or status
  colorMode?: 'type' | 'status';

  // Interaction mode
  interactionMode: string | null;

  // Misc
  validationErrors: ValidationError[];
  parties: PartyInfo[];
  landUsePlan: LandUsePlan | null;

  // Active selection/inspector
  activePlanId: string | null;
  inspectorOpen: boolean;
  selectedZoneIds: Set<string | number>;

  // Measurements
  lastMeasurement: { type: 'area' | 'length'; value: number; units?: string } | null;
  // Dialog states
  pointsDialogOpen: boolean;
}

export interface SubdivisionActions {
  // Map and API actions
  setMap: (map: MapboxMap | null) => void;
  getMap: () => MapboxMap | null;
  setAPI: (api: any) => void;
  setStyleName: (style: string) => void;
  
  // Label actions
  setLabelField: (field: string) => void;
  setLabelsVisible: (visible: boolean) => void;

  // Parent parcel actions
  setParentParcel: (parcel: ParcelFeature | null) => void;

  // Subdivision actions
  addSubdivision: (subdivision: SubdivisionFeature) => void;
  updateSubdivision: (id: string, updates: Partial<SubdivisionFeature>) => void;
  deleteSubdivision: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  updateSubdivisions: (fn: (prev: SubdivisionFeature[]) => SubdivisionFeature[]) => void;

  // Plan actions
  setActivePlan: (id: string | null) => void;

  // Measurement actions
  setLastMeasurement: (measurement: { type: 'area' | 'length'; value: number; units?: string } | null) => void;

  // Validation actions
  setValidationErrors: (errors: ValidationError[]) => void;

  // Zone selection actions
  selectZone: (fid: string | number) => void;
  deselectZone: (fid: string | number) => void;
  clearZoneSelection: () => void;
  setFeatureStateById: (fid: string | number, state: Record<string, any>) => void;
  // Re-apply current selection to the map (mimics zoning resiliency)
  applySelectionToMap: () => void;

  // Inspector actions
  setInspectorOpen: (open: boolean) => void;

  // UI actions
  setIsDrawing: (drawing: boolean) => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setDrawMode: (mode: 'polygon' | 'line' | 'point' | null) => void;
  setInteractionMode: (m: string | null) => void;

  // Plans/layer actions
  setPlans: (plans: PlanSummary[]) => void;
  togglePlan: (id: string | number) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setLandUsePlan: (plan: LandUsePlan | null) => void;
  setShowPlans: (v: boolean) => void;
  setShowParcels: (v: boolean) => void;
  setParcelOpacity: (n: number) => void;
  setBoundaryGlow: (b: boolean) => void;
  setPlansOpacity: (n: number) => void;
  // Coloring
  setColorMode?: (m: 'type' | 'status') => void;

  // Labels
  toggleLabels: () => void;
  // Dialog controls
  setPointsDialogOpen: (open: boolean) => void;
}
