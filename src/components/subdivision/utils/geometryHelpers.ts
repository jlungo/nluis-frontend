/**
 * Geometry utilities for coordinate extraction and bounds calculation
 */

/**
 * Calculate bounds from GeoJSON FeatureCollection
 */
export const fcToBounds = (fc: any): [[number, number], [number, number]] | null => {
  if (!fc || !fc.features || !fc.features.length) return null;
  
  try {
    // Manual bbox calculation
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    
    const extractCoords = (geometry: any) => {
      const coords: [number, number][] = [];
      const collectCoords = (arr: any[]): void => {
        arr.forEach(item => {
          if (Array.isArray(item) && typeof item[0] === 'number') {
            coords.push([item[0], item[1]]);
          } else if (Array.isArray(item)) {
            collectCoords(item);
          }
        });
      };

      if (geometry.type === 'Point') {
        coords.push(geometry.coordinates as [number, number]);
      } else if (geometry.type === 'Polygon') {
        collectCoords(geometry.coordinates[0]);
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygon: any) => {
          collectCoords(polygon[0]);
        });
      } else if (geometry.type === 'LineString') {
        collectCoords(geometry.coordinates);
      }
      return coords;
    };

    fc.features.forEach((feature: any) => {
      const coords = extractCoords(feature.geometry);
      coords.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
      });
    });

    return [[minLng, minLat], [maxLng, maxLat]];
  } catch {
    return null;
  }
};

/**
 * Extract coordinates from any geometry type
 */
export const extractCoordinatesFromGeometry = (geometry: any): [number, number][] => {
  const coords: [number, number][] = [];
  
  if (!geometry) return coords;
  
  const collectCoords = (arr: any[]): void => {
    arr.forEach(item => {
      if (Array.isArray(item) && typeof item[0] === 'number') {
        coords.push([item[0], item[1]]);
      } else if (Array.isArray(item)) {
        collectCoords(item);
      }
    });
  };

  if (geometry.type === 'Point') {
    coords.push(geometry.coordinates as [number, number]);
  } else if (geometry.type === 'Polygon') {
    collectCoords(geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((polygon: any) => {
      collectCoords(polygon[0]);
    });
  } else if (geometry.type === 'LineString') {
    collectCoords(geometry.coordinates);
  }

  return coords;
};

/**
 * Calculate bounds from feature geometry
 */
export const calculateBoundsFromFeature = (feature: any): [[number, number], [number, number]] | null => {
  const coords = extractCoordinatesFromGeometry(feature.geometry || feature.properties?.geometry);
  if (coords.length === 0) return null;

  const lons = coords.map(p => p[0]);
  const lats = coords.map(p => p[1]);
  
  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)]
  ];
};

/**
 * Calculate area from bounds (width * height)
 */
export const calculateAreaFromBounds = (bounds: [[number, number], [number, number]]): number => {
  const width = Math.abs(bounds[1][0] - bounds[0][0]);
  const height = Math.abs(bounds[1][1] - bounds[0][1]);
  return width * height;
};

/**
 * Calculate dynamic zoom padding based on feature area
 */
export const getZoomPaddingForArea = (area: number, basePadding: number = 20): number => {
  if (area < 0.0001) return 40;
  if (area < 0.01) return 60;
  return basePadding;
};
