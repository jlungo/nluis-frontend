import React from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';
import type { MapLayerType } from '@/types/zoning';
import { createLayerStyle, getGeometryType } from '@/utils/zoningUtils';

import type {
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
} from 'geojson';

interface MapLayerProps {
  layer: MapLayerType;
}

export const MapLayer: React.FC<MapLayerProps> = ({ layer }) => {
  if (!layer.visible || !layer.data || !layer.data.features.length) {
    return null;
  }

  const geometryType = getGeometryType(layer);
  const layerStyle = createLayerStyle(
    layer.id,
    geometryType,
    layer.color || '#088',
    layer.opacity || 0.4
  );

  return (
    <Source
      id={layer.id}
      type="geojson"
      data={layer.data as FeatureCollection<Geometry, GeoJsonProperties>}
    >
      <Layer {...layerStyle} />
    </Source>
  );
};