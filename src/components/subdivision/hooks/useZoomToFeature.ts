/**
 * Hook for managing zoom to feature functionality
 */
import { useCallback } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import { calculateBoundsFromFeature, calculateAreaFromBounds, getZoomPaddingForArea } from '../utils/geometryHelpers';

export const useZoomToFeature = (getMap: () => MapboxMap | any) => {
  return useCallback((
    feature: any,
    padding: number = 20,
    duration: number = 1000
  ) => {
    const m = getMap();
    if (!m || !feature) return;

    try {
      const geometry = feature.geometry || feature.properties?.geometry;
      if (!geometry) return;

      const bounds = calculateBoundsFromFeature(feature);
      if (!bounds) return;

      const area = calculateAreaFromBounds(bounds);
      const zoomPadding = getZoomPaddingForArea(area, padding);

      m.fitBounds(bounds, {
        padding: zoomPadding,
        duration: duration,
        maxZoom: 18
      });
    } catch (error) {
      console.error('Error zooming to feature:', error);
    }
  }, [getMap]);
};
