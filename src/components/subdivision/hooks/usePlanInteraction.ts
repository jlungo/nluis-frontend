/**
 * Hook for managing plan interaction (click, hover, selection)
 */
import { useCallback, useRef } from 'react';
import useSubdivisionStore from '../store/useSubdivisionStore';

export const usePlanInteraction = (
  getMap: () => any,
  isDrawing: boolean,
  zoomToFeature: (feature: any, padding?: number, duration?: number) => void
) => {
  const prevHoverRef = useRef<string | number | null>(null);

  const handlePlanClick = useCallback((e: any) => {
    const m = getMap();
    if (!m) return;
    
    if (isDrawing) return;
    
    try {
      const features = m.queryRenderedFeatures(e.point, { layers: ['plans-fill'] }) || [];
      if (!features.length) return;
      
      const feature = features[0];
      const fid = feature.properties?.id ?? feature.id;
      
      if (!fid) return;

      const setSelectedId = useSubdivisionStore.getState().setSelectedId;
      const setActivePlan = useSubdivisionStore.getState().setActivePlan;
      const selectZone = useSubdivisionStore.getState().selectZone;
      const deselectZone = useSubdivisionStore.getState().deselectZone;

      const already = useSubdivisionStore.getState().selectedZoneIds.has(String(fid));
      if (already) deselectZone(String(fid));
      else selectZone(String(fid));

      setSelectedId(String(fid));

      const pid = String(feature.properties?.plan_id ?? feature.properties?.planId ?? feature.properties?.plan ?? '');
      if (pid) setActivePlan(pid);

      zoomToFeature(feature, 40, 800);
    } catch (error) {
      console.error('Error handling plan click:', error);
    }
  }, [getMap, isDrawing, zoomToFeature]);

  const handleMapMouseMove = useCallback((e: any) => {
    const m = getMap();
    if (!m) return;
    
    if (isDrawing) {
      const canvas = m.getCanvas?.();
      if (canvas) canvas.style.cursor = 'crosshair';
      return;
    }
    
    try {
      const features = m.queryRenderedFeatures(e.point, { layers: ['plans-fill'] }) || [];
      const id = features[0]?.properties?.id ?? features[0]?.id ?? null;
      
      if (prevHoverRef.current && prevHoverRef.current !== id) {
        try {
          m.setFeatureState(
            { source: 'plans-tiles', sourceLayer: 'zones', id: String(prevHoverRef.current) },
            { hover: false }
          );
        } catch {}
        prevHoverRef.current = null;
      }
      
      if (id && id !== prevHoverRef.current) {
        try {
          m.setFeatureState(
            { source: 'plans-tiles', sourceLayer: 'zones', id: String(id) },
            { hover: true }
          );
          prevHoverRef.current = id;
          const canvas = m.getCanvas?.();
          if (canvas) canvas.style.cursor = 'pointer';
        } catch {}
      } else if (!id) {
        const canvas = m.getCanvas?.();
        if (canvas) canvas.style.cursor = '';
      }
    } catch {}
  }, [getMap, isDrawing]);

  const handleMapDoubleClick = useCallback((e: any) => {
    const m = getMap();
    if (!m) return;

    const features = m.queryRenderedFeatures(e.point, { layers: ['plans-fill'] }) || [];
    if (features.length > 0) {
      const feature = features[0];
      zoomToFeature(feature, 80, 600);
      return;
    }

    const zoom = m.getZoom();
    m.easeTo({
      center: e.lngLat,
      zoom: zoom + 1,
      duration: 400
    });
  }, [getMap, zoomToFeature]);

  const handleMapRightClick = useCallback((e: any) => {
    e.preventDefault();
    const m = getMap();
    if (!m) return;

    m.easeTo({
      center: e.lngLat,
      zoom: Math.min(m.getZoom() + 2, 18),
      duration: 500
    });
  }, [getMap]);

  return {
    prevHoverRef,
    handlePlanClick,
    handleMapMouseMove,
    handleMapDoubleClick,
    handleMapRightClick,
  };
};
