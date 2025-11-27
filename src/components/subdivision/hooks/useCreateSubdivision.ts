/**
 * Hook for managing subdivision creation and coordinate conversion
 */
import { useCallback } from 'react';
import { centroid, intersect as turfIntersect } from '@turf/turf';
import type { SubdivisionFeature, ParcelFeature } from '@/types/subdivision';
import { calculateUTM } from '../utils/projectionHelpers';

export const useCreateSubdivision = (
  selectedPlan: any,
  parentParcel?: ParcelFeature
) => {
  return useCallback((geometry: any, drawId: string): SubdivisionFeature => {
    const tempId = `temp_${Date.now()}`;
    let geomToUse = geometry;
    
    // Clip to selected plan if set
    if (selectedPlan?.geometry) {
      try {
        const clipped = turfIntersect(geomToUse, selectedPlan.geometry);
        if (clipped?.geometry) geomToUse = clipped.geometry;
      } catch {}
    }
    
    // Calculate centroid and UTM
    let centroidPt: any = null;
    let utm: any = null;
    
    if (geomToUse?.type && geomToUse.type !== 'Point') {
      try {
        const cen = centroid({ type: 'Feature', geometry: geomToUse });
        const [lng, lat] = cen.geometry.coordinates;
        centroidPt = { lng, lat };
        utm = calculateUTM(lng, lat);
      } catch {}
    }
    
    return {
      type: 'Feature',
      geometry: geomToUse,
      properties: {
        id: tempId,
        title: `Parcel ${tempId}`,
        size: 0,
        status: 'Pending',
        landUseId: '0',
        parentId: parentParcel?.properties?.id || '',
        ...(selectedPlan ? ({ planId: selectedPlan.id, parentPlan: (selectedPlan.properties as any)?.name || selectedPlan.id } as any) : {}),
        allocations: [],
        subdivisionDate: new Date().toISOString(),
        approvalStatus: 'Pending',
        centroid: centroidPt,
        utm,
        _drawId: drawId,
      } as any,
    } as any as SubdivisionFeature;
  }, [selectedPlan, parentParcel]);
};
