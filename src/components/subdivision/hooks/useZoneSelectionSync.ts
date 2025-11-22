/**
 * Hook for managing zone selection state sync between store and map
 */
import { useEffect } from 'react';
import useSubdivisionStore from '../store/useSubdivisionStore';

export const useZoneSelectionSync = (getMap: () => any, selectedZoneIds: Set<string | number>) => {
  useEffect(() => {
    const m = getMap();
    if (!m) return;

    const toMapId = (fid: any) => {
      if (typeof fid === 'number') return fid;
      if (typeof fid === 'string') {
        const n = Number(fid);
        if (Number.isFinite(n) && String(n) === fid) return n;
      }
      return fid;
    };

    const prev = ((useSubdivisionStore.getState() as any).__prevSelectedForSync as Set<string | number>) || new Set<string | number>();
    const curr = new Set<string | number>(Array.from(selectedZoneIds).map(String));

    // Turn off removed
    prev.forEach((fid) => {
      if (!curr.has(fid)) {
        try {
          m.setFeatureState(
            { source: 'plans-tiles', sourceLayer: 'zones', id: toMapId(fid) },
            { selected: false }
          );
        } catch {}
      }
    });

    // Turn on added
    curr.forEach((fid) => {
      if (!prev.has(fid)) {
        try {
          m.setFeatureState(
            { source: 'plans-tiles', sourceLayer: 'zones', id: toMapId(fid) },
            { selected: true }
          );
        } catch {}
      }
    });

    // Save snapshot
    try {
      (useSubdivisionStore.getState() as any).__prevSelectedForSync = curr;
    } catch {}
  }, [selectedZoneIds, getMap]);
};
