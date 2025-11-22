import { type Map as MapboxMap } from 'mapbox-gl';
import { type ParcelFeature, type SubdivisionFeature, type PartyInfo, type ValidationError } from '@/types/subdivision';

// Map state
export interface MapState {
  map: MapboxMap | null;
  styleName: string;
  labelsVisible: boolean;
  getMap: () => MapboxMap | null;
  setMap: (map: MapboxMap | null) => void;
  setStyleName: (style: string) => void;
  setLabelsVisible: (visible: boolean) => void;
}

// Plan state (land-use plans)
export interface PlanSummary {
  id: string;
  name: string;
  color?: string;
  info?: string;
  selected?: boolean;
  count?: number;
}

// Combined subdivision state
export interface SubdivisionState extends MapState {
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
  drawMode?: 'polygon' | 'line' | 'point' | null;

  // Plans / layer controls (land-use plans)
  plans: PlanSummary[];
  showPlans: boolean;
  showParcels: boolean;
  parcelOpacity: number;
  boundaryGlow: boolean;

  // Labels
  labelField: string;

  // Interaction mode (points / draw / select etc.)
  interactionMode?: string | null;

  // API state
  api: any;
  validationErrors: ValidationError[];
  parties: PartyInfo[];
  activePlanId: string | null;
  inspectorOpen: boolean;
  lastMeasurement: { type: 'area' | 'length'; value: number; units?: string } | null;
}