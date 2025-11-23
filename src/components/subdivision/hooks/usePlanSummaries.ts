/**
 * Hook for managing plan summary and synchronization from tile sources
 */
import { useCallback, useEffect } from 'react';
import useSubdivisionStore from '../store/useSubdivisionStore';
import { usePlansQuery } from '@/queries/usePlansQuery';

export const usePlanSummaries = (getMap: () => any, localityId?: string | number | null) => {
  const plansQuery = usePlansQuery(localityId ? { locality: localityId } : null as any);

  const recomputePlans = useCallback(() => {
    const m = getMap();
    if (!m || !m.isStyleLoaded?.()) return [] as any[];

    let feats: any[] = [];
    try {
      feats = m.querySourceFeatures('plans-tiles', { sourceLayer: 'zones' }) || [];
    } catch {}

    if (!feats || feats.length === 0) {
      try {
        feats = m.queryRenderedFeatures({ layers: ['plans-fill'] }) || [];
      } catch {}
    }

    return feats;
  }, [getMap]);

  const updatePlanSummariesFromMap = useCallback(() => {
    try {
      const feats = recomputePlans();
      if (!feats || feats.length === 0) {
        return;
      }

      const prevPlans = useSubdivisionStore.getState().plans || [];
      const prevMap: Record<string, any> = {};
      prevPlans.forEach((p: any) => { prevMap[String(p.id)] = p; });

      const grouped: Record<string, any[]> = {};
      (feats || []).forEach((f: any) => {
        const raw = f.properties?.plan_id ?? f.properties?.plan ?? f.properties?.planId;
        if (raw == null || raw === '') return;
        const planId = String(raw);
        if (!grouped[planId]) grouped[planId] = [];
        grouped[planId].push(f);
      });

      let summaries = Object.keys(grouped).map((planId) => {
        const arr = grouped[planId];
        const sample = arr[0] || {};
        const name = sample.properties?.plan_name || sample.properties?.name || `Plan ${planId}`;
        const color = sample.properties?.color || sample.properties?.colour || (prevMap[planId]?.color) || undefined;
        return {
          id: planId,
          name,
          color,
          count: arr.length,
          selected: !!prevMap[planId]?.selected,
        };
      });

      try {
        if (plansQuery && plansQuery.data && Array.isArray(plansQuery.data)) {
          const apiMap: Record<string, any> = {};
          plansQuery.data.forEach((p: any) => {
            const raw = p.plan_id ?? p.id ?? p.pk ?? p.uuid ?? p.name ?? p.title;
            const id = String(raw ?? '');
            apiMap[id] = p;
          });
          summaries = summaries.map((s: any) => ({
            ...s,
            name: apiMap[String(s.id)]?.name || apiMap[String(s.id)]?.title || s.name,
            color: s.color || apiMap[String(s.id)]?.color || apiMap[String(s.id)]?.colour || s.color,
          }));
        }
      } catch {}

      useSubdivisionStore.getState().setPlans(summaries);
    } catch (err) {}
  }, [recomputePlans, plansQuery]);

  const applySelectionToMap = useCallback(() => {
    const m = getMap();
    if (!m) return;

    try {
      const curr = new Set<string>(Array.from(useSubdivisionStore.getState().selectedZoneIds || []).map(String));
      const toMapId = (fid: any) => {
        if (typeof fid === 'number') return fid;
        if (typeof fid === 'string') {
          const n = Number(fid);
          if (Number.isFinite(n) && String(n) === fid) return n;
        }
        return fid;
      };
      curr.forEach((fid) => {
        try {
          m.setFeatureState({ source: 'plans-tiles', sourceLayer: 'zones', id: toMapId(fid) }, { selected: true });
        } catch {}
      });
    } catch {}
  }, [getMap]);

  // Listen for tile load events
  useEffect(() => {
    const m = getMap();
    if (!m) return;

    const onSourceData = (e: any) => {
      try {
        if (e?.sourceId === 'plans-tiles' || e?.source === 'plans-tiles') {
          updatePlanSummariesFromMap();
          applySelectionToMap();
        }
      } catch {}
    };

    const onIdle = () => {
      try {
        updatePlanSummariesFromMap();
        applySelectionToMap();
      } catch {}
    };

    m.on('sourcedata', onSourceData);
    m.on('data', onSourceData);
    m.on('idle', onIdle);

    return () => {
      try {
        m.off('sourcedata', onSourceData);
        m.off('data', onSourceData);
        m.off('idle', onIdle);
      } catch {}
    };
  }, [getMap, updatePlanSummariesFromMap, applySelectionToMap]);

  // Initial build when dependencies change
  useEffect(() => {
    updatePlanSummariesFromMap();
    applySelectionToMap();
  }, [updatePlanSummariesFromMap, applySelectionToMap, localityId]);

  return {
    recomputePlans,
    updatePlanSummariesFromMap,
    applySelectionToMap,
  };
};
