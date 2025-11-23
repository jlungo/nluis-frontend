/**
 * Parent parcel layer component
 */
import { Source, Layer } from 'react-map-gl/mapbox';
import type { ParcelFeature } from '@/types/subdivision';

interface ParcelLayersProps {
  parentParcel?: ParcelFeature;
}

export function ParcelLayers({ parentParcel }: ParcelLayersProps) {
  if (!parentParcel) return null;

  return (
    <Source id="parent-parcel" type="geojson" data={parentParcel}>
      <Layer
        id="parcel-fill"
        type="fill"
        source="parent-parcel"
        paint={{ 'fill-color': '#bfdbfe', 'fill-opacity': 0.18 }}
      />
      <Layer
        id="parcel-line"
        type="line"
        source="parent-parcel"
        paint={{ 'line-color': '#2563eb', 'line-width': 2 }}
      />
    </Source>
  );
}
