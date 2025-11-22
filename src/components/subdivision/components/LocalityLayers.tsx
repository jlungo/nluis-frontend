/**
 * Locality boundary layer component
 */
import { Source, Layer } from 'react-map-gl/mapbox';

interface LocalityLayersProps {
  localityBoundary: any;
}

export function LocalityLayers({ localityBoundary }: LocalityLayersProps) {
  if (!localityBoundary) return null;

  return (
    <Source id="locality-boundary" type="geojson" data={localityBoundary}>
      <Layer
        id="locality-boundary-fill"
        type="fill"
        source="locality-boundary"
        paint={{
          'fill-color': '#f0f9ff',
          'fill-opacity': 0.15,
        }}
      />
      <Layer
        id="locality-boundary-line"
        type="line"
        source="locality-boundary"
        paint={{
          'line-color': '#0284c7',
          'line-width': 2.5,
          'line-dasharray': [4, 2],
        }}
      />
    </Source>
  );
}
