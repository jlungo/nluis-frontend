import { Source, Layer } from 'react-map-gl/mapbox';
import type { MapLayerType } from '@/types/zoning';
import { createLayerStyle } from '@/utils/zoningUtils';

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

  // Detect all geometry types in this layer
  const geometryTypes = new Set(
    layer.data.features.map(f => f.geometry.type.toLowerCase())
  );

  const color = layer.color || '#088';
  const opacity = layer.opacity || 0.4;

  const polygonFillStyle = createLayerStyle(`${layer.id}-fill`, 'polygon', color, opacity);
  const lineStringStyle = createLayerStyle(`${layer.id}-linestring`, 'linestring', color, opacity);
  const pointStyle = createLayerStyle(`${layer.id}-point`, 'point', color, opacity);

  return (
    <Source
      id={layer.id}
      type="geojson"
      data={layer.data as FeatureCollection<Geometry, GeoJsonProperties>}
    >
      {/* Render polygon layers if present */}
      {(geometryTypes.has('polygon') || geometryTypes.has('multipolygon')) && (
        <>
          <Layer
            {...polygonFillStyle}
            filter={['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]]}
          />
          <Layer
            id={`${layer.id}-line`}
            source={layer.id}
            type="line"
            filter={['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]]}
            paint={{
              'line-color': '#000',
              'line-width': 1,
            }}
          />
        </>
      )}
      
      {/* Render line layers if present */}
      {(geometryTypes.has('linestring') || geometryTypes.has('multilinestring')) && (
        <Layer
          {...lineStringStyle}
          filter={['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]]}
        />
      )}
      
      {/* Render point layers if present */}
      {(geometryTypes.has('point') || geometryTypes.has('multipoint')) && (
        <Layer
          {...pointStyle}
          filter={['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]]}
        />
      )}
    </Source>
  );
};