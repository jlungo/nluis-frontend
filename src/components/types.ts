import { FeatureCollection } from "geojson";

export interface ActiveLayers {
  regions: boolean;
  districts: boolean;
  wards: boolean;
  villages: boolean;
}

export type LayerKey = keyof ActiveLayers;

export interface MapBoxMapProps {
  selectedFeature?: string | null;
  selectedType?: string | null;
  activeLayers: ActiveLayers;
  layerData: Partial<Record<LayerKey, FeatureCollection>>;
  onFeatureClick: (name: string, type: string, properties: unknown) => void;
}
