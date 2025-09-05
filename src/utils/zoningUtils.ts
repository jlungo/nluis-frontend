import type { MapLayerType } from '@/types/zoning';

export const generateLayerColors = (): string[] => [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export const createLayerStyle = (
  layerId: string, 
  geometryType: string = 'polygon',
  color: string = '#088',
  opacity: number = 0.4
) => {
  const baseStyle = {
    id: layerId,
    source: layerId,
  };

  switch (geometryType.toLowerCase()) {
    case 'polygon':
    case 'multipolygon':
      return {
        ...baseStyle,
        type: 'fill' as const,
        paint: {
          'fill-color': color,
          'fill-opacity': opacity,
          'fill-outline-color': '#000'
        }
      };
    
    case 'linestring':
    case 'multilinestring':
      return {
        ...baseStyle,
        type: 'line' as const,
        paint: {
          'line-color': color,
          'line-width': 2,
          'line-opacity': opacity + 0.4
        }
      };
    
    case 'point':
    case 'multipoint':
      return {
        ...baseStyle,
        type: 'circle' as const,
        paint: {
          'circle-color': color,
          'circle-radius': 6,
          'circle-opacity': opacity + 0.4,
          'circle-stroke-color': '#000',
          'circle-stroke-width': 1
        }
      };
    
    default:
      return {
        ...baseStyle,
        type: 'fill' as const,
        paint: {
          'fill-color': color,
          'fill-opacity': opacity,
          'fill-outline-color': '#000'
        }
      };
  }
};

export const getGeometryType = (layer: MapLayerType): string => {
  if (!layer.data?.features.length) return 'polygon';
  
  const firstFeature = layer.data.features[0];
  return firstFeature.geometry.type.toLowerCase();
};

export const calculateBounds = (layers: MapLayerType[]): [[number, number], [number, number]] | null => {
  const visibleLayers = layers.filter(layer => layer.visible && layer.data);
  if (!visibleLayers.length) return null;

  let minLng = Infinity, minLat = Infinity;
  let maxLng = -Infinity, maxLat = -Infinity;

  visibleLayers.forEach(layer => {
    layer.data?.features.forEach(feature => {
      const { coordinates } = feature.geometry;
      
      const flattenCoords = (coords: any): number[][] => {
        if (typeof coords[0] === 'number') return [coords as number[]];
        if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') return coords as number[][];
        return coords.flat(2).filter((coord: any) => Array.isArray(coord) && coord.length === 2);
      };

      const flatCoords = flattenCoords(coordinates);
      flatCoords.forEach(([lng, lat]) => {
        if (typeof lng === 'number' && typeof lat === 'number') {
          minLng = Math.min(minLng, lng);
          minLat = Math.min(minLat, lat);
          maxLng = Math.max(maxLng, lng);
          maxLat = Math.max(maxLat, lat);
        }
      });
    });
  });

  return [[minLng, minLat], [maxLng, maxLat]];
};