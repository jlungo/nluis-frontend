import type { RefObject } from 'react';
import useSubdivisionStore from '../store/useSubdivisionStore';
import { intersect as turfIntersect } from '@turf/turf';

type MapRefAny = any;

export interface CreateToolboxOptions {
  mapRef: RefObject<MapRefAny>;
  drawRef: RefObject<any>;
  recomputePlans?: () => any[];
  zoomToFeature?: (feature: any, padding?: number, duration?: number) => void;
  getPlansTilesTemplate?: () => string | null;
  getLocalityBounds?: () => [[number, number], [number, number]] | null;
}

const safeGetMap = (mapRef: RefObject<MapRefAny>) => {
  try {
    return mapRef.current?.getMap?.() || mapRef.current;
  } catch {
    return mapRef.current;
  }
};

export function createToolbox(opts: CreateToolboxOptions) {
  const { mapRef, drawRef, recomputePlans, zoomToFeature, getPlansTilesTemplate, getLocalityBounds } = opts;

  const getMap = () => safeGetMap(mapRef);

  const store = useSubdivisionStore.getState();

  const api = {
    startSelect: () => {
      const draw = drawRef.current;
      const map = getMap();
      if (!draw || !map) return;
      try {
        draw.changeMode('simple_select');
        store.setDrawMode(null);
        store.setIsDrawing(false);
        const canvas = map.getCanvas();
        if (canvas) canvas.style.cursor = 'pointer';
      } catch (err) {
        console.error('toolbox.startSelect failed', err);
      }
    },

    startDrawPolygon: () => {
      const draw = drawRef.current;
      const map = getMap();
      if (!draw || !map) return;
      try {
        draw.changeMode('draw_polygon');
        store.setDrawMode('polygon');
        store.setIsDrawing(true);
        const canvas = map.getCanvas();
        if (canvas) canvas.style.cursor = 'crosshair';
      } catch (err) {
        console.error('toolbox.startDrawPolygon failed', err);
      }
    },

    startDrawLine: () => {
      const draw = drawRef.current;
      const map = getMap();
      if (!draw || !map) return;
      try {
        draw.changeMode('draw_line_string');
        store.setDrawMode('line');
        store.setIsDrawing(true);
        const canvas = map.getCanvas();
        if (canvas) canvas.style.cursor = 'crosshair';
      } catch (err) {
        console.error('toolbox.startDrawLine failed', err);
      }
    },

    startDrawPoint: () => {
      const draw = drawRef.current;
      const map = getMap();
      if (!draw || !map) return;
      try {
        draw.changeMode('draw_point');
        store.setDrawMode('point');
        store.setIsDrawing(true);
        const canvas = map.getCanvas();
        if (canvas) canvas.style.cursor = 'crosshair';
      } catch (err) {
        console.error('toolbox.startDrawPoint failed', err);
      }
    },

    selectPlan: (planId: string) => {
      try {
        const m = getMap();
        if (!m) return;
        const feats = (recomputePlans ? recomputePlans() : m.queryRenderedFeatures({ layers: ['plans-fill'] })) || [];
        const plan = feats.find((f: any) => String(f.id) === String(planId) || String(f.properties?.id) === String(planId));
        if (!plan) return;

        // Clear current selection if any
        const prevId = store.activePlanId;
        if (prevId && prevId !== planId) {
          try {
            m.setFeatureState({ source: 'plans-tiles', sourceLayer: 'zones', id: prevId }, { selected: false, hover: false });
          } catch {}
        }

        const id = plan.id ?? plan.properties?.id;
        store.setActivePlan(String(id));
        store.setSelectedId(String(id));

        try {
          m.setFeatureState({ source: 'plans-tiles', sourceLayer: 'zones', id: id }, { selected: true, hover: false });
        } catch {}

        if (zoomToFeature) zoomToFeature(plan, 40, 800);
      } catch (err) { console.error('toolbox.selectPlan', err); }
    },

    getSelectedPlan: () => {
      try {
        const m = getMap();
        if (!m) return null;
        const id = store.activePlanId;
        const feats = recomputePlans ? recomputePlans() : (m.queryRenderedFeatures({ layers: ['plans-fill'] }) || []);
        return feats.find((f: any) => String(f.id) === String(id) || String(f.properties?.id) === String(id)) || null;
      } catch (err) { console.error('toolbox.getSelectedPlan', err); return null; }
    },

    manipulatePlan: (action: 'subdivide' | 'split' | 'merge' | 'edit') => {
      try {
        const id = store.activePlanId;
        if (!id) { console.warn('toolbox.manipulatePlan: no active plan'); return; }
        // Placeholder: emit success toast/log. Specific logic can be implemented later.
        console.info(`manipulatePlan(${action}) for plan ${id}`);
      } catch (err) { console.error('toolbox.manipulatePlan', err); }
    },

    addParcelsToPlan: (parcels: any[]) => {
      try {
        const id = store.activePlanId;
        if (!id) { console.warn('toolbox.addParcelsToPlan: no active plan'); return; }
        const m = getMap();
        let selectedPlanGeom: any = null;
        const feats = recomputePlans ? recomputePlans() : (m ? (m.queryRenderedFeatures({ layers: ['plans-fill'] }) || []) : []);
        const plan = feats.find((f: any) => String(f.id) === String(id) || String(f.properties?.id) === String(id));
        if (plan) selectedPlanGeom = plan.geometry;

        const clipped = parcels.map((parcel) => {
          try {
            if (!selectedPlanGeom) return parcel;
            const c = turfIntersect(parcel.geometry, selectedPlanGeom);
            if (c) return { ...parcel, geometry: c.geometry, properties: { ...parcel.properties, planId: id, parentPlan: plan?.properties?.name || id } };
          } catch (err) { console.error('toolbox.addParcelsToPlan clip error', err); }
          return parcel;
        }).filter(Boolean);

        clipped.forEach((p) => store.addSubdivision(p));
      } catch (err) { console.error('toolbox.addParcelsToPlan', err); }
    },

    zoomToPlan: (planId: string) => {
      try {
        const m = getMap();
        if (!m) return;
        const feats = recomputePlans ? recomputePlans() : (m.queryRenderedFeatures({ layers: ['plans-fill'] }) || []);
        const plan = feats.find((f: any) => String(f.id) === String(planId) || String(f.properties?.id) === String(planId));
        if (plan) {
          if (zoomToFeature) zoomToFeature(plan, 40, 800);
        }
      } catch (err) { console.error('toolbox.zoomToPlan', err); }
    },

    zoomToLocation: (lng: number, lat: number, zoomLevel: number = 16) => {
      try {
        const m = getMap();
        if (!m) return;
        m.flyTo({ center: [lng, lat], zoom: zoomLevel, duration: 1000 });
      } catch (err) { console.error('toolbox.zoomToLocation', err); }
    },

    zoomToExtent: (bounds: [[number, number], [number, number]], padding: number = 40) => {
      try {
        const m = getMap();
        if (!m) return;
        m.fitBounds(bounds, { padding, duration: 800, maxZoom: 18 });
      } catch (err) { console.error('toolbox.zoomToExtent', err); }
    },

    openAddPoints: () => {
      try {
        const s: any = useSubdivisionStore.getState();
        s.setPointsDialogOpen(true);
        s.setDrawMode(null);
        s.setIsDrawing(false);
      } catch (err) { console.error('toolbox.openAddPoints', err); }
    },

    toggleLabels: (v?: boolean) => {
      try {
        const s = useSubdivisionStore.getState();
        const newValue = typeof v === 'boolean' ? v : !s.labelsVisible;
        s.setLabelsVisible(newValue);
      } catch (err) { console.error('toolbox.toggleLabels', err); }
    },

    setLabelField: (f: string | null) => {
      try { useSubdivisionStore.getState().setLabelField(f || ''); } catch (err) { console.error('toolbox.setLabelField', err); }
    },

    selectAll: () => useSubdivisionStore.getState().selectAll(),
    deselectAll: () => useSubdivisionStore.getState().deselectAll(),

    saveToAPI: async () => {
      try {
        const subs = store.subdivisions || [];
        console.debug('toolbox.saveToAPI stub called', subs.length);
        return { ok: true };
      } catch (err) { console.error('toolbox.saveToAPI', err); return { ok: false }; }
    },

    getPlans: () => {
      try {
        const m = getMap();
        if (!m) return [];
        return recomputePlans ? recomputePlans() : (m.queryRenderedFeatures({ layers: ['plans-fill'] }) || []);
      } catch (err) { console.error('toolbox.getPlans', err); return []; }
    },

    getPlansCount: () => {
      try { return (api.getPlans() || []).length; } catch { return 0; }
    },

    refreshPlans: () => {
      try {
        const m = getMap();
        if (!m) return;
        // Guard: ensure style is loaded before accessing sources
        if (m.isStyleLoaded?.() && m.getSource && m.getSource('plans-tiles')) {
          const src: any = m.getSource('plans-tiles');
          if (src?.setTiles && getPlansTilesTemplate) {
            const template = getPlansTilesTemplate();
            const [base] = (template || '').split('?');
            try { src.setTiles([`${base}?v=${Date.now()}`]); } catch {}
          } else {
            try { m.triggerRepaint?.(); } catch {}
          }
        }
      } catch (err) { console.error('toolbox.refreshPlans', err); }
    },

    autoZoomToPlans: () => {
      try {
        const m = getMap();
        if (!m) return;
        const lb = getLocalityBounds ? getLocalityBounds() : null;
        if (lb) { m.fitBounds(lb, { padding: 80, duration: 700 }); return; }
        const activePlanId = store.activePlanId;
        if (activePlanId) { api.zoomToPlan(activePlanId); return; }
        const feats = api.getPlans();
        if (feats && feats.length) { if (zoomToFeature) zoomToFeature(feats[0], 40, 700); return; }
      } catch (err) { console.error('toolbox.autoZoomToPlans', err); }
    },

    zoomToLocalityBounds: () => {
      try {
        const m = getMap();
        const lb = getLocalityBounds ? getLocalityBounds() : null;
        if (!m || !lb) return;
        m.fitBounds(lb, { padding: 80, duration: 700 });
      } catch (err) { console.error('toolbox.zoomToLocalityBounds', err); }
    }
  } as const;

  return api;
}

export default createToolbox;
