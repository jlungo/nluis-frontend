/**
 * Custom hook for managing map instance and refs
 */
import { useCallback, useRef } from 'react';
import type { MapRef } from 'react-map-gl/mapbox';
import type { Map as MapboxMap } from 'mapbox-gl';

export const useMapInstance = () => {
  const mapRef = useRef<MapRef | null>(null);

  const getMap = useCallback((): MapboxMap | MapRef | null => {
    return mapRef.current?.getMap?.() || mapRef.current;
  }, []);

  const setMapRef = useCallback((ref: MapRef | null) => {
    mapRef.current = ref;
  }, []);

  return {
    mapRef,
    getMap,
    setMapRef,
  };
};
