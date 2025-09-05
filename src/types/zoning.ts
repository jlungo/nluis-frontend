export interface GeoJSONFeatureType {
  type: 'Feature';
  id?: string | number;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
    coordinates: number[] | number[][] | number[][][] | number[][][][];
  };
  properties: Record<string, any>;
}

export interface GeoJSONFeatureCollectionType {
  type: 'FeatureCollection';
  name?: string;
  features: GeoJSONFeatureType[];
}

export interface MapLayerType {
  id: string;
  name: string;
  data: GeoJSONFeatureCollectionType | null;
  visible: boolean;
  editable: boolean;
  isBase: boolean;
  color?: string;
  opacity?: number;
}

export interface ViewportStateType {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface ShapefileMapPropsType {
  baseMapId?: string;
  overlayMapsIds?: string[];
  mapboxAccessToken?: string;
  mapboxStyle?: string;
  initialViewport?: Partial<ViewportStateType>;
  onLayerChange?: (layers: MapLayerType[]) => void;
  onError?: (error: string) => void;
  className?: string;
}
