export type LabelField = "land_use_name" | "land_use" | "id" | "none";

export type ZoningMapAPI = {
  // Project
  saveToAPI: () => void;
  saveAsGeoJSON: () => void;
  saveAsShapefile: () => Promise<void>;
  getSelectedIds: () => (string | number)[];
  // Draw / Input
  openAddPoints: () => void;
  startSelect?: () => void;
  startDrawPoint: () => void;
  startDrawLine: () => void;
  startDrawPolygon: () => void;

  //   Layers
  openDelimitedText?: () => void;
  openVectorGeoJSON?: () => void;
  openShapefileZip?: () => void;
  openWebTiles?: () => void;
  setBasemapVisible: (visible: boolean) => void;

  // Labels
  toggleLabels: (visible: boolean) => void;
  setLabelField: (field: LabelField) => void;

  // Panels
  focusLayersPanel: () => void;

  //Edit
  editSelectedFeatures: () => void;
  approveSelected: () => void;
  rejectSelected: () => void;
  sendToDraftSelected: () => void;

  // Right panel actions (exposed by the map)
  approve?: () => void;
  reject?: () => void;
  deleteZone?: () => void;
  assignLandUseToActive?: (landUseId: number) => void;
  // conflicts
  resolveTrim?: (withId?: string | number) => Promise<void>;
  resolveSplit?: (withIds?: Array<string | number>) => Promise<void>;
  resolveIgnore?: (withIds?: Array<string | number>) => Promise<void>;
};
