import { type ParcelFeature, type SubdivisionFeature } from '@/types/subdivision';
import { useParcelSubdivisionsQuery } from '@/queries/useParcelQuery';
import { useRef, useEffect, useCallback, useState } from 'react';
import MapGL, { Source, Layer, type MapRef } from 'react-map-gl/mapbox';
import type { Map as MapboxMap } from 'mapbox-gl';
import { MapControls } from './MapControls';
import { type MapPoint } from './types';
import { type PointRow, type CoordMode } from './PointDialog';
import { toast } from 'sonner';
import 'mapbox-gl/dist/mapbox-gl.css';
// @ts-expect-error no types for this package in workspace
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import useSubdivisionStore from '../store/useSubdivisionStore';
import api, { getAccessToken, refreshAccessToken } from '@/lib/axios';
// plan detail query moved to toolbox when needed
import proj4 from 'proj4';
import { 
  centroid, 
  polygonToLine, 
  polygonize, 
  length as turfLength, 
  area as turfArea, 
  intersect as turfIntersect,
  bbox as turfBbox,
} from '@turf/turf';
import { featureCollection as turfFeatureCollection } from '@turf/helpers';
import MeasurePanel from '../MeasurePanel';
import PointDialog from './PointDialog';
import createToolbox from '../tools/toolbox';
import { Menu, PanelRight, Minimize, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlansQuery } from '@/queries/usePlansQuery';

interface SubdivisionMapViewerProps {
  parentParcel?: ParcelFeature;
  localityId?: string | number | null;
  isMaximized?: boolean;
  onToggleFullscreen?: () => void;
}

const INITIAL_VIEW_STATE = {
  longitude: 35.7516,
  latitude: -6.3690,
  zoom: 5.8,
};

const UTM_ZONES = {
  'EPSG:32735': "+proj=utm +zone=35 +south +datum=WGS84 +units=m +no_defs +type=crs",
  'EPSG:32736': "+proj=utm +zone=36 +south +datum=WGS84 +units=m +no_defs +type=crs",
  'EPSG:32737': "+proj=utm +zone=37 +south +datum=WGS84 +units=m +no_defs +type=crs",
};

// Initialize UTM projections once
Object.entries(UTM_ZONES).forEach(([epsg, def]) => {
  try {
    proj4.defs(epsg, def);
  } catch {}
});

// Helper function to calculate bounds from GeoJSON
const fcToBounds = (fc: any): [[number, number], [number, number]] | null => {
  if (!fc || !fc.features || !fc.features.length) return null;
  
  try {
    const bbox = turfBbox(fc);
    return [
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]]
    ];
  } catch {
    return null;
  }
};

// Helper to extract coordinates from geometry for zooming
const extractCoordinatesFromGeometry = (geometry: any): [number, number][] => {
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

export default function SubdivisionMapViewer({ 
  parentParcel, 
  localityId,
  isMaximized,
  onToggleFullscreen,
}: SubdivisionMapViewerProps) {
  // Fetch authoritative plan metadata for the locality (if provided)
  const plansQuery = usePlansQuery(localityId ? { locality: localityId } : null as any);
  // Refs
  const mapRef = useRef<MapRef | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const prevHoverRef = useRef<string | number | null>(null);

  // Local state (not derived from store)
  // Points dialog is driven from the centralized store so toolbar/toolbox can open it
  const pointsOpen = useSubdivisionStore((s) => s.pointsDialogOpen);
  const setPointsOpen = useSubdivisionStore((s) => s.setPointsDialogOpen);
  // dev/debug counters removed for minimal surface
  const [localityBoundary, setLocalityBoundary] = useState<any>(null);
  const [localityBounds, setLocalityBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  // map interactive flag currently unused
  //

  // Backend data
  const { data: backendSubdivisions = [] } = useParcelSubdivisionsQuery(
    parentParcel?.properties.id
  );
  
  // Store selectors - use shallow comparison for primitive values
  const styleName = useSubdivisionStore((s) => s.styleName);
  const labelsVisible = useSubdivisionStore((s) => s.labelsVisible);
  const showPlans = useSubdivisionStore((s) => s.showPlans);
  const parcelOpacity = useSubdivisionStore((s) => s.parcelOpacity);
  const plansOpacity = useSubdivisionStore((s) => s.plansOpacity);
  const boundaryGlow = useSubdivisionStore((s) => s.boundaryGlow);
  const colorMode = useSubdivisionStore((s) => s.colorMode || 'type');
  const selectedZoneIds = useSubdivisionStore((s) => s.selectedZoneIds);
  const isDrawing = useSubdivisionStore((s) => s.isDrawing);
  const drawMode = useSubdivisionStore((s) => s.drawMode);
  const selectedId = useSubdivisionStore((s) => s.selectedId);
  // plansOpacity available in store; not directly used in viewer

  // Store actions - stable references
  const setMap = useSubdivisionStore((s) => s.setMap);
  const setIsDrawing = useSubdivisionStore((s) => s.setIsDrawing);
  const setDrawMode = useSubdivisionStore((s) => s.setDrawMode);
  const addSubdivision = useSubdivisionStore((s) => s.addSubdivision);
  const updateSubdivisions = useSubdivisionStore((s) => s.updateSubdivisions);
  const togglePlan = useSubdivisionStore((s) => s.togglePlan);
  const setSelectedId = useSubdivisionStore((s) => s.setSelectedId);
  const setActivePlan = useSubdivisionStore((s) => s.setActivePlan);

  // Fetch plan detail only when needed
  // planDetailArg is not used in viewer; toolbox can fetch plan details if needed

  // Fetch locality boundary for base map and calculate bounds
  useEffect(() => {
    if (!localityId) {
      setLocalityBoundary(null);
      setLocalityBounds(null);
      return;
    }

    const fetchBoundary = async () => {
      try {
        const response = await api.get(`/localities/localities/${localityId}/boundary/`);
        const boundaryData = response.data;
        setLocalityBoundary(boundaryData);
        
        // Calculate bounds from locality boundary
        const bounds = fcToBounds(boundaryData);
        setLocalityBounds(bounds);
      } catch (error) {
        console.error('Failed to fetch locality boundary:', error);
        setLocalityBoundary(null);
        setLocalityBounds(null);
      }
    };

    fetchBoundary();
  }, [localityId]);

  // Helper: Get map instance
  const getMap = useCallback(() => {
    return mapRef.current?.getMap?.() || mapRef.current;
  }, []);

  // Helper: Calculate UTM coordinates
  const calculateUTM = useCallback((lng: number, lat: number) => {
    const utmZone = Math.floor((lng + 180) / 6) + 1;
    const epsg = `EPSG:${32700 + utmZone}`;
    try {
      const projected = proj4('EPSG:4326', epsg, [lng, lat]);
      return { x: projected[0], y: projected[1], zone: utmZone, epsg };
    } catch {
      return null;
    }
  }, []);

  // Helper: Get plans tiles template (use latest plan tiles endpoint)
  const getPlansTilesTemplate = useCallback(() => {
    // Use the axios baseURL but avoid duplicating API prefix
    const API_BASE = (api.defaults.baseURL || '').replace(/\/$/, '');
    if (!localityId) return null; // don't return a template with a placeholder - Mapbox will attempt to fetch literal braces

    // Return the full MVT tiles endpoint URL with the complete API path
    return `${API_BASE}/zoning/plans/latest/${localityId}/tiles/{z}/{x}/{y}.mvt`;
  }, [localityId]);

  // Transform requests for Mapbox to attach auth headers when calling our API tiles
  const API_BASE = (api.defaults.baseURL || '').replace(/\/$/, '');
  const transformRequest = useCallback((url: string) => {
    // Attach headers for our API tile requests (robust check: with or without scheme)
    if (typeof url === 'string') {
      const bare = API_BASE.replace(/^https?:\/\//, '');
      const isApiCall = url.startsWith(API_BASE) || url.startsWith(bare);
      if (isApiCall) {
        const token = getAccessToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return { url, headers };
      }
    }
    return { url };
  }, [API_BASE]);

  // Enhanced zoom to feature with detailed level
  const zoomToFeature = useCallback((feature: any, padding: number = 20, duration: number = 1000) => {
    const m = getMap();
    if (!m || !feature) return;

    try {
      const geometry = feature.geometry || feature.properties?.geometry;
      if (!geometry) return;

      const coords = extractCoordinatesFromGeometry(geometry);
      if (coords.length === 0) return;

      const lons = coords.map(p => p[0]);
      const lats = coords.map(p => p[1]);
      
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)]
      ];

      // Calculate area to determine zoom level
      const width = Math.abs(bounds[1][0] - bounds[0][0]);
      const height = Math.abs(bounds[1][1] - bounds[0][1]);
      const area = width * height;

      // Adjust zoom based on area - smaller areas get more zoom
      let zoomPadding = padding;
      if (area < 0.0001) { // Very small area
        zoomPadding = 40; // More padding for very small features
      } else if (area < 0.01) { // Small area
        zoomPadding = 60;
      }

      m.fitBounds(bounds, { 
        padding: zoomPadding, 
        duration: duration,
        maxZoom: 18 // Allow very close zoom for details
      });

    } catch (error) {
      console.error('Error zooming to feature:', error);
    }
  }, [getMap]);

  // Enhanced plan click handler with selection and detailed zoom (only when not drawing)
  const handlePlanClick = useCallback((e: any) => {
    const m = getMap();
    if (!m) return;
    
    // Don't handle plan clicks when in drawing mode
    if (isDrawing) return;
    
    try {
      const features = m.queryRenderedFeatures(e.point, { layers: ['plans-fill'] }) || [];
      if (!features.length) return;
      
      const feature = features[0];
      const fid = feature.properties?.id ?? feature.id;
      
      if (!fid) return;

      // Make this the active context (for zoom/clip), but do not clear others (multi-select)
      setSelectedPlan({
        id: fid,
        properties: feature.properties,
        geometry: feature.geometry
      });

      // Toggle selection in store (multi-select)
      try {
        const already = useSubdivisionStore.getState().selectedZoneIds.has(String(fid));
        if (already) useSubdivisionStore.getState().deselectZone(String(fid));
        else useSubdivisionStore.getState().selectZone(String(fid));
      } catch {}
      setSelectedId(String(fid));
      const pid = String(feature.properties?.plan_id ?? feature.properties?.planId ?? feature.properties?.plan ?? '');
      if (pid) setActivePlan(pid);

      // Zoom to the selected plan with detailed view
      zoomToFeature(feature, 40, 800);
      
    } catch (error) {
      console.error('Error handling plan click:', error);
    }
  }, [getMap, selectedPlan, togglePlan, setSelectedId, setActivePlan, zoomToFeature, isDrawing]);

  // Double-click handler for quick zoom to details
  const handleMapDoubleClick = useCallback((e: any) => {
    const m = getMap();
    if (!m) return;

    // If double-clicking on a plan, zoom to it with maximum detail
    const features = m.queryRenderedFeatures(e.point, { layers: ['plans-fill'] }) || [];
    if (features.length > 0) {
      const feature = features[0];
      zoomToFeature(feature, 80, 600); // More padding for double-click zoom
      return;
    }

    // Otherwise, use default double-click zoom behavior
    const zoom = m.getZoom();
    m.easeTo({
      center: e.lngLat,
      zoom: zoom + 1, // Zoom in one level
      duration: 400
    });
  }, [getMap, zoomToFeature]);

  // Right-click handler for context menu and quick actions
  const handleMapRightClick = useCallback((e: any) => {
    e.preventDefault();
    const m = getMap();
    if (!m) return;

    // Quick zoom to clicked point
    m.easeTo({
      center: e.lngLat,
      zoom: Math.min(m.getZoom() + 2, 18), // Zoom in but cap at max zoom
      duration: 500
    });

    toast.info('Zoomed to location');
  }, [getMap]);

  //

  // Add parcels to selected plan
  // addParcelsToSelectedPlan moved to toolbox; keep implementation in toolbox instead

  // Create subdivision feature with clipping and calculations
  const createSubdivisionFeature = useCallback((geometry: any, drawId: string): SubdivisionFeature => {
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
        // allow additional properties through any-cast
        ...(selectedPlan ? ({ planId: selectedPlan.id, parentPlan: (selectedPlan.properties as any)?.name || selectedPlan.id } as any) : {}),
        allocations: [],
        subdivisionDate: new Date().toISOString(),
        approvalStatus: 'Pending',
        centroid: centroidPt,
        utm,
        _drawId: drawId,
      } as any,
    } as any as SubdivisionFeature;
  }, [selectedPlan, parentParcel, calculateUTM]);

  // Map style effect - only when styleName changes
  useEffect(() => {
    const m = getMap() as MapboxMap;
    if (!m) return;

    try {
      m.setStyle(`mapbox://styles/mapbox/${styleName}`);
    } catch (error) {
      console.error('Error setting map style:', error);
    }
  }, [styleName, getMap]);

  // Label visibility effect - only when labelsVisible changes
  useEffect(() => {
    const m = getMap() as MapboxMap;
    if (!m || !m.getStyle) return;

    try {
      const style = m.getStyle();
      if (!style?.layers) return;
      
      style.layers.forEach((layer: any) => {
        const id = layer.id;
        if (!id) return;

        const isLabel = 
          (layer.layout && layer.layout['text-field']) || 
          id.toLowerCase().includes('label') || 
          id.toLowerCase().includes('place');
        
        if (isLabel) {
          try {
            m.setLayoutProperty(id, 'visibility', labelsVisible ? 'visible' : 'none');
          } catch {}
        }
      });
    } catch (error) {
      console.error('Error updating label visibility:', error);
    }
  }, [labelsVisible, getMap]);

  // Register map instance in store once
  useEffect(() => {
    const m = getMap();
    if (m) setMap(m as MapboxMap);
    return () => setMap(null);
  }, [setMap, getMap]);

  // Plan hover handler - stable callback (don't show hover when drawing)
  const handleMapMouseMove = useCallback((e: any) => {
    const m = getMap();
    if (!m) return;
    
    // Don't show hover effects when in drawing mode
    if (isDrawing) {
      const canvas = m.getCanvas?.();
      if (canvas) canvas.style.cursor = 'crosshair';
      return;
    }
    
    try {
      const features = m.queryRenderedFeatures(e.point, { layers: ['plans-fill'] }) || [];
      const id = features[0]?.properties?.id ?? features[0]?.id ?? null;
      
      // Don't hover over selected plan
      if (selectedPlan && id === selectedPlan.id) {
        const canvas = m.getCanvas?.();
        if (canvas) canvas.style.cursor = 'pointer';
        return;
      }
      
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
  }, [getMap, selectedPlan, isDrawing]);

  // Sync paint/layout properties when they change
  useEffect(() => {
    const m = getMap();
    if (!m || !m.isStyleLoaded?.()) return;
    
    try {
      const mapInstance = m as MapboxMap;
      
      if (mapInstance.getLayer('plans-fill')) {
        mapInstance.setLayoutProperty('plans-fill', 'visibility', showPlans ? 'visible' : 'none');
      }
      if (mapInstance.getLayer('parcel-fill')) {
        mapInstance.setPaintProperty('parcel-fill', 'fill-opacity', parcelOpacity);
      }
      if (mapInstance.getLayer('parcel-line')) {
        mapInstance.setPaintProperty('parcel-line', 'line-width', boundaryGlow ? 3 : 2);
      }
      if (mapInstance.getLayer('plans-line')) {
        mapInstance.setPaintProperty('plans-line', 'line-width', boundaryGlow ? 2.5 : 0.75);
      }
    } catch {}
  }, [getMap, showPlans, parcelOpacity, boundaryGlow]);

  // Attach plan interaction event listeners
  useEffect(() => {
    const m = getMap();
    if (!m) return;
    
    m.on('mousemove', handleMapMouseMove);
    
    return () => {
      try {
        m.off('mousemove', handleMapMouseMove);
      } catch {}
    };
  }, [getMap, handleMapMouseMove]);

  // Robust store -> map sync for selected zones
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
    // Track previous selection to compute deltas
  const prev = ((useSubdivisionStore.getState() as any).__prevSelectedForSync as Set<string>) || new Set<string>();
    const curr = new Set<string>(Array.from(selectedZoneIds).map(String));

    // Turn off removed
    prev.forEach((fid) => {
      if (!curr.has(fid)) {
        try { m.setFeatureState({ source: 'plans-tiles', sourceLayer: 'zones', id: toMapId(fid) }, { selected: false }); } catch {}
      }
    });
    // Turn on added
    curr.forEach((fid) => {
      if (!prev.has(fid)) {
        try { m.setFeatureState({ source: 'plans-tiles', sourceLayer: 'zones', id: toMapId(fid) }, { selected: true }); } catch {}
      }
    });
    // Save snapshot
    try { (useSubdivisionStore.getState() as any).__prevSelectedForSync = curr; } catch {}
  }, [selectedZoneIds, getMap]);

  // Recompute plans list or counts from tile source (tries sourceFeatures then rendered)
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

    // return features for caller to inspect
    return feats;
  }, [getMap]);

  // Auto-zoom helper: attempt to zoom to locality bounds, activePlanDetail, or to first plan feature
  // autoZoomToPlans now provided via toolbox; viewer no longer exposes it here.

  // Helper: recompute plans and push summaries into the store
  const updatePlanSummariesFromMap = useCallback(() => {
    try {
      const feats = recomputePlans();
      if (!feats || feats.length === 0) {
        // Avoid clearing plans during transient tile reloads; keep previous state
        return;
      }
      

      const prevPlans = useSubdivisionStore.getState().plans || [];
      const prevMap: Record<string, any> = {};
      prevPlans.forEach((p: any) => { prevMap[String(p.id)] = p; });

      const grouped: Record<string, any[]> = {};
      (feats || []).forEach((f: any) => {
        const raw = f.properties?.plan_id ?? f.properties?.plan ?? f.properties?.planId;
        if (raw == null || raw === '') return; // skip features without a plan id
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

  // Listen for source/tile load events so we can recompute plans and update store
  useEffect(() => {
    const m = getMap();
    if (!m) return;

    const applySelectionToMap = () => {
      try {
        const curr = new Set<string>(Array.from(useSubdivisionStore.getState().selectedZoneIds || []).map(String));
        const toMapId = (fid: any) => {
          if (typeof fid === 'number') return fid;
          if (typeof fid === 'string') { const n = Number(fid); if (Number.isFinite(n) && String(n) === fid) return n; }
          return fid;
        };
        curr.forEach((fid) => {
          try { m.setFeatureState({ source: 'plans-tiles', sourceLayer: 'zones', id: toMapId(fid) }, { selected: true }); } catch {}
        });
      } catch {}
    };

    const onSourceData = (e: any) => {
      try {
        if (e?.sourceId === 'plans-tiles' || e?.source === 'plans-tiles') {
          updatePlanSummariesFromMap();
          applySelectionToMap();
        }
      } catch {}
    };

    const onIdle = () => {
      try { updatePlanSummariesFromMap(); applySelectionToMap(); } catch {}
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
  }, [getMap, updatePlanSummariesFromMap]);

  // Initial plan summary build when dependencies change
  useEffect(() => {
    updatePlanSummariesFromMap();
    try {
      const m = getMap();
      if (m) {
        const curr = new Set<string>(Array.from(useSubdivisionStore.getState().selectedZoneIds || []).map(String));
        const toMapId = (fid: any) => {
          if (typeof fid === 'number') return fid;
          if (typeof fid === 'string') { const n = Number(fid); if (Number.isFinite(n) && String(n) === fid) return n; }
          return fid;
        };
        curr.forEach((fid) => {
          try { m.setFeatureState({ source: 'plans-tiles', sourceLayer: 'zones', id: toMapId(fid) }, { selected: true }); } catch {}
        });
      }
    } catch {}
  }, [updatePlanSummariesFromMap, localityId]);

  // Tile error handler & refresh (attach to map once)
  useEffect(() => {
    const m = getMap();
    if (!m) return;

    const onError = async (e: any) => {
      
      const status = e?.error?.status || e?.error?.cause?.status;

      // 401: try token refresh and cache-bust
      if (status === 401) {
        try {
          await refreshAccessToken();
          // Guard: only access source when style is loaded to avoid mapbox internals failing
          if (m.isStyleLoaded?.() && m.getSource && m.getSource('plans-tiles')) {
            const src: any = m.getSource('plans-tiles');
            if (src?.setTiles) {
              const template = getPlansTilesTemplate();
              const [base] = (template || '').split('?');
              try { src.setTiles([`${base}?v=${Date.now()}`]); } catch {}
            } else {
              try { m.triggerRepaint?.(); } catch {}
            }
          }
        } catch {}
        return;
      }
    };

    m.on('error', onError);
    return () => {
      try { m.off('error', onError); } catch {}
    };
  }, [getMap, getPlansTilesTemplate]);

  // Zoom to selected subdivision
  useEffect(() => {
    if (!selectedId) return;
    const m = getMap();
    if (!m) return;
    
    try {
      const subdivisions = useSubdivisionStore.getState().subdivisions || [];
      const found = subdivisions.find((s: any) => 
        s.properties?.id === selectedId || 
        s.properties?._drawId === selectedId
      );
      
      if (found) {
        zoomToFeature(found, 40, 700);
      }
    } catch {}
  }, [selectedId, getMap, zoomToFeature]);

  // Initial auto-zoom only once on mount (if locality bounds available)
  useEffect(() => {
    const m = getMap();
    if (!m) return;

    // Only auto-zoom once on initial load if locality bounds exist
    if (localityBounds) {
      try {
        m.fitBounds(localityBounds, { padding: 80, duration: 700 });
      } catch {}
    }
    // This effect should only run once when the component first mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only on mount

  // Handle drawing mode changes and measurement mode
  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    
    if (!isDrawing) {
      try {
        draw.changeMode('simple_select');
        // Clear any ongoing measurements
        useSubdivisionStore.getState().setLastMeasurement(null);
      } catch {}
      return;
    }
    
    const modeMap: Record<string, string[]> = {
      line: ['draw_line_string', 'draw_line', 'draw_polyline'],
      point: ['draw_point'],
      polygon: ['draw_polygon'],
    };
    
    const modes = modeMap[drawMode || 'polygon'] || ['draw_polygon'];
    
    const interactionMode = useSubdivisionStore.getState().interactionMode;
    const isMeasuring = interactionMode === 'draw';
    
    for (const mode of modes) {
      try {
        // If measuring, don't complete the feature automatically
        if (isMeasuring) {
          draw.changeMode(mode, { 
            measurementMode: true,
            preventCompletion: true 
          });
        } else {
          draw.changeMode(mode);
        }
        break;
      } catch {}
    }
  }, [isDrawing, drawMode]);

  // Fullscreen toggle listener
  useEffect(() => {
    const handler = async () => {
      try {
        const m = getMap();
        const container = m?.getContainer?.();
        if (!container) return;
        
        const mapInstance = m as MapboxMap;
        if (!document.fullscreenElement) {
          if (container.requestFullscreen) {
            await container.requestFullscreen();
            if (mapInstance.resize) {
              mapInstance.resize();
              // Ensure draw modes persist after resize
              const draw = drawRef.current;
              if (draw && isDrawing) {
                const modes = drawMode === 'line' 
                  ? ['draw_line_string', 'draw_line'] 
                  : drawMode === 'point' 
                  ? ['draw_point'] 
                  : ['draw_polygon'];
                
                for (const mode of modes) {
                  try {
                    draw.changeMode(mode);
                    break;
                  } catch {}
                }
              }
            }
          } else {
            document.body.classList.toggle('sub-fullscreen');
          }
        } else {
          await document.exitFullscreen();
          if (mapInstance.resize) {
            mapInstance.resize();
            // Ensure draw modes persist after resize
            const draw = drawRef.current;
            if (draw && isDrawing) {
              const modes = drawMode === 'line' 
                ? ['draw_line_string', 'draw_line'] 
                : drawMode === 'point' 
                ? ['draw_point'] 
                : ['draw_polygon'];
              
              for (const mode of modes) {
                try {
                  draw.changeMode(mode);
                  break;
                } catch {}
              }
            }
          }
        }
      } catch {
        document.body.classList.toggle('sub-fullscreen');
      }
    };
    
    window.addEventListener('subdivision:toggle-fullscreen', handler as EventListener);
    return () => window.removeEventListener('subdivision:toggle-fullscreen', handler as EventListener);
  }, [getMap, isDrawing, drawMode]);

  // Enhanced map load with better interaction settings
  const handleMapLoad = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    
    // Enhanced interaction settings
    map.boxZoom.enable();
    map.scrollZoom.enable();
    map.dragRotate.enable();
    map.dragPan.enable();
    map.keyboard.enable();
    map.doubleClickZoom.enable();
    map.touchZoomRotate.enable();
    
    // Set more sensitive scroll zoom
    map.scrollZoom.setWheelZoomRate(1 / 450);
    map.scrollZoom.setZoomRate(0.1);
    
    setMap(map);
    
    // Remove existing draw control if any
    if (drawRef.current) {
      map.removeControl(drawRef.current);
      drawRef.current = null;
    }
    
    // Initialize draw tools with enhanced configuration for parcel subdivision
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
        point: true,
        line_string: true,
      },
      userProperties: true,
      persistentDrawing: true,
      defaultMode: 'simple_select',
      styles: [
        // Enhanced point style
        {
          'id': 'gl-draw-point',
          'type': 'circle',
          'filter': ['all', ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          'paint': {
            'circle-radius': 5,
            'circle-color': '#fff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#2563eb'
          }
        },
        // Enhanced line style
        {
          'id': 'gl-draw-line',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#2563eb',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        // Enhanced polygon fill style
        {
          'id': 'gl-draw-polygon-fill',
          'type': 'fill',
          'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          'paint': {
            'fill-color': '#2563eb',
            'fill-outline-color': '#2563eb',
            'fill-opacity': 0.1
          }
        },
        // Enhanced polygon stroke style
        {
          'id': 'gl-draw-polygon-stroke',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#2563eb',
            'line-width': 2
          }
        },
        // Active point style (for measurements)
        {
          'id': 'gl-draw-point-active',
          'type': 'circle',
          'filter': ['all',
            ['==', '$type', 'Point'],
            ['==', 'active', 'true']
          ],
          'paint': {
            'circle-radius': 7,
            'circle-color': '#fff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#2563eb'
          }
        },
        // Midpoint style (for measurements)
        {
          'id': 'gl-draw-point-midpoint',
          'type': 'circle',
          'filter': ['all',
            ['==', '$type', 'Point'],
            ['==', 'meta', 'midpoint']
          ],
          'paint': {
            'circle-radius': 4,
            'circle-color': '#fff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#2563eb'
          }
        }
      ]
    });
    
    map.addControl(draw);
    drawRef.current = draw;
    
    // Apply pending draw mode if already active
    if (isDrawing) {
      const modes = drawMode === 'line' 
        ? ['draw_line_string', 'draw_line'] 
        : drawMode === 'point' 
        ? ['draw_point'] 
        : ['draw_polygon'];
      
      for (const mode of modes) {
        try {
          draw.changeMode(mode);
          break;
        } catch {}
      }
    }
    
    // Only auto-zoom to locality bounds once on initial map load (if available)
    if (localityBounds) {
      try {
        map.fitBounds(localityBounds, { padding: 80, duration: 700 });
      } catch {}
    }
    
    // Enhanced draw event handlers for parcel management
    const onCreate = (e: any) => {
      const features = e.features || [];
      
      features.forEach((f: any) => {
        const drawId = f.id || String(Date.now());
        
        // Handle line splitting
        if (f.geometry?.type === 'LineString' && drawMode === 'line' && parentParcel) {
          try {
            const parentLines = polygonToLine(parentParcel);
            const linesFc = turfFeatureCollection([parentLines, f]);
            const polyResult = polygonize(linesFc);
            const pieces = polyResult?.features || [];
            
            let counter = Date.now();
            pieces.forEach((p: any) => {
              const feature = createSubdivisionFeature(p.geometry, `sub_${counter++}`);
              addSubdivision(feature);
            });
          } catch {
            const feature = createSubdivisionFeature(f.geometry, drawId);
            addSubdivision(feature);
          }
          return;
        }
        
        // Regular feature creation
        const feature = createSubdivisionFeature(f.geometry, drawId);
        addSubdivision(feature);
        
        // Store measurement if in measurement mode
        try {
          const interactionMode = useSubdivisionStore.getState().interactionMode;
          if (interactionMode === 'draw') {
            if (f.geometry.type === 'LineString') {
              const lenKm = turfLength(f, { units: 'kilometers' });
              useSubdivisionStore.getState().setLastMeasurement({
                type: 'length',
                value: lenKm * 1000,
                units: 'm',
              });
              draw.delete(f.id);
            } else if (f.geometry.type === 'Polygon') {
              const a = turfArea(f);
              useSubdivisionStore.getState().setLastMeasurement({
                type: 'area',
                value: a,
                units: 'm²',
              });
              draw.delete(f.id);
            }
            // Stay in measurement mode
            const modes = drawMode === 'line' 
              ? ['draw_line_string', 'draw_line'] 
              : ['draw_polygon'];
            for (const mode of modes) {
              try {
                draw.changeMode(mode, { 
                  measurementMode: true,
                  preventCompletion: true 
                });
                break;
              } catch {}
            }
            return;
          }
        } catch {}
      });
      
      try {
        draw.changeMode('simple_select');
        setIsDrawing(false);
      } catch {}
    };
    
    // Draw event: update
    const onUpdate = (e: any) => {
      const features = e.features || [];
      if (!features.length) return;
      
      updateSubdivisions((prev) =>
        prev.map((sub) => {
          const match = features.find((f: any) => 
            f.id && sub.properties?._drawId === f.id
          );
          return match ? { ...sub, geometry: match.geometry } : sub;
        })
      );
    };
    
    // Draw event: delete
    const onDelete = (e: any) => {
      const features = e.features || [];
      if (!features.length) return;
      
      const ids = features.map((f: any) => f.id);
      updateSubdivisions((prev) => 
        prev.filter((sub) => !ids.includes(sub.properties?._drawId))
      );
    };
    
    // Inspector click handler
    const onMapClick = (ev: any) => {
      try {
        const inspectorOpen = useSubdivisionStore.getState().inspectorOpen;
        if (!inspectorOpen) return;
        
        const features = map.queryRenderedFeatures(ev.point);
        const feature = features?.[0];
        const id = feature?.properties?.id || feature?.properties?._drawId;
        
        if (id) {
          useSubdivisionStore.getState().setSelectedId(id);
        }
      } catch {}
    };
    
    map.on('draw.create', onCreate);
    map.on('draw.update', onUpdate);
    map.on('draw.delete', onDelete);
    map.on('draw.modechange', handleDrawModeChange);
    map.on('click', onMapClick);
    
    // Cleanup function
    (drawRef as any).currentCleanup = () => {
      try {
        map.off('draw.create', onCreate);
        map.off('draw.update', onUpdate);
        map.off('draw.delete', onDelete);
        map.off('draw.modechange', handleDrawModeChange); 
        map.off('click', onMapClick);
        map.removeControl(draw);
      } catch {}
    };
  }, [
    setMap,
    isDrawing,
    drawMode,
    parentParcel,
    createSubdivisionFeature,
    addSubdivision,
    setIsDrawing,
    updateSubdivisions,
    localityBounds,
  ]);

  // Handle draw mode changes 
  const handleDrawModeChange = useCallback(({ mode }: { mode: string }) => {
    const container = mapRef.current?.getContainer();
    if (!container) return;
    
    // Update cursor based on mode
    if (mode === 'simple_select' || mode === 'direct_select') {
      container.style.cursor = 'default';
      setIsDrawing(false);
    } else if (mode.startsWith('draw_')) {
      container.style.cursor = 'crosshair';
      setIsDrawing(true);
    }
  }, [setIsDrawing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        (drawRef as any).currentCleanup?.();
      } catch {}
    };
  }, []);

  // Handle points confirmation
  const handlePointsConfirm = useCallback((points: PointRow[], mode: CoordMode, epsg?: string) => {
    if (points.length < 3) {
      toast.error('Need at least 3 points to create a polygon');
      return;
    }
    
    // Convert points to WGS84 if needed
    const convertedPoints: MapPoint[] = points.map(point => {
      if (mode === 'wgs84') {
        return { lng: Number(point.a), lat: Number(point.b) };
      } else if (epsg && mode === 'projected') {
        // Convert from UTM to WGS84
        try {
          const [lon, lat] = proj4(epsg, 'EPSG:4326', [Number(point.a), Number(point.b)]);
          return { lng: lon, lat: lat };
        } catch (err) {
          toast.error(`Failed to convert coordinates: ${err}`);
          return null;
        }
      } else {
        toast.error('EPSG code required for projected coordinates');
        return null;
      }
    }).filter((p): p is MapPoint => p !== null);

    if (convertedPoints.length < 3) {
      toast.error('Failed to convert some coordinates. Need at least 3 valid points.');
      return;
    }

    // Create a single polygon from all points
    const coordinates = [
      [
        ...convertedPoints.map(p => [p.lng, p.lat]),
        // Close the polygon by repeating the first point
        [convertedPoints[0].lng, convertedPoints[0].lat]
      ]
    ];

    // Calculate centroid from all points
    const centroid = {
      lng: convertedPoints.reduce((sum, p) => sum + p.lng, 0) / convertedPoints.length,
      lat: convertedPoints.reduce((sum, p) => sum + p.lat, 0) / convertedPoints.length
    };
    
    const utm = calculateUTM(centroid.lng, centroid.lat);
    
    const feature: SubdivisionFeature = {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [coordinates],
      },
      properties: {
        id: `poly_${Date.now()}`,
        title: `Polygon from ${points.length} points`,
        size: 0, // This will be calculated by the map
        status: 'Pending',
        landUseId: '0',
        parentId: parentParcel?.properties?.id || '',
        ...(selectedPlan ? ({ planId: selectedPlan.id, parentPlan: (selectedPlan.properties as any)?.name || selectedPlan.id } as any) : {}),
        allocations: [],
        subdivisionDate: new Date().toISOString(),
        approvalStatus: 'Pending',
        centroid,
        utm,
      },
    };
    
    addSubdivision(feature);
  setPointsOpen(false);
    setDrawMode(null);
    setIsDrawing(false);
  }, [parentParcel, calculateUTM, addSubdivision, setDrawMode, setIsDrawing, selectedPlan]);

  // Handle points dialog close
  const handlePointsOpenChange = useCallback((newOpen: boolean) => {
    setPointsOpen(newOpen);
    if (!newOpen) {
      setDrawMode(null);
      setIsDrawing(false);
    }
  }, [setDrawMode, setIsDrawing, setPointsOpen]);

  // Register centralized toolbox API (safe wiring)
  useEffect(() => {
    const toolbox = createToolbox({
      mapRef,
      drawRef,
      recomputePlans,
      zoomToFeature,
      getPlansTilesTemplate,
      getLocalityBounds: () => localityBounds,
    });

    useSubdivisionStore.getState().setAPI(toolbox as any);
    return () => {
      // Don't clear API; it's merged and harmless. Avoids racey resets.
      try { useSubdivisionStore.getState().setAPI({}); } catch {}
    };
  // only re-register if core references change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recomputePlans, zoomToFeature, localityBounds, getPlansTilesTemplate]);

  // Responsive map resize
  useEffect(() => {
    const el = document.querySelector('.sub-main-area');
    if (!el) return;
    
    const handleResize = () => {
      const m = getMap();
      m?.resize?.();
    };
    
    const ro = new ResizeObserver(handleResize);
    ro.observe(el);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [getMap]);

  // Refresh plans tiles when locality changes
  useEffect(() => {
    const m = getMap();
    if (!m) return;
    
    try {
      if (m.isStyleLoaded?.() && m.getSource && m.getSource('plans-tiles')) {
        const src: any = m.getSource('plans-tiles');
        if (src?.setTiles) {
          const template = getPlansTilesTemplate();
          try { src.setTiles([`${template}&v=${Date.now()}`]); } catch {}
        } else {
          try { m.triggerRepaint?.(); } catch {}
        }
      }
    } catch {}
  }, [localityId, getMap, getPlansTilesTemplate]);

  // Add enhanced map controls UI
  // Map floating controls have been moved to the top toolbar (toolbar/tools.ts)

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="p-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Subdivision Map</h4>
          <div className="text-xs text-muted-foreground">
            {selectedPlan ? `Selected Plan: ${selectedPlan.id}` : 'Click on a plan to select'}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div>
            Subdivisions: <strong>{backendSubdivisions.length}</strong>
            {selectedPlan && ` | Plan: ${selectedPlan.id}`}
          </div>
          {onToggleFullscreen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleFullscreen?.()}
              className="h-8 px-2 ml-2"
              title={isMaximized ? 'Exit full screen' : 'Full screen'}
            >
              {isMaximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      <div className="relative flex-1">
        <div 
          className="absolute inset-0"
          style={{ cursor: isDrawing ? 'crosshair' : 'grab' }}
        >
          <MapGL
            ref={mapRef}
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            transformRequest={transformRequest}
            initialViewState={INITIAL_VIEW_STATE}
            onLoad={handleMapLoad}
            onClick={handlePlanClick}
            onDblClick={handleMapDoubleClick}
            onContextMenu={handleMapRightClick}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            maxZoom={20}
            minZoom={3}
            dragRotate
            dragPan
            scrollZoom
            boxZoom
            doubleClickZoom
            keyboard
            interactiveLayerIds={isDrawing ? [] : ["plans-fill", "plans-line"]}
            
            onDragStart={() => {
              const container = mapRef.current?.getContainer();
              if (container && !isDrawing) {
                container.style.cursor = 'grabbing';
              }
            }}
            onDragEnd={() => {
              const container = mapRef.current?.getContainer();
              if (container && !isDrawing) {
                container.style.cursor = 'grab';
              }
            }}
            onMouseEnter={() => {
              const container = mapRef.current?.getContainer();
              if (container && !isDrawing) {
                container.style.cursor = 'grab';
              }
            }}
          >
            <MapControls map={mapRef} position="top-left" />
            {/* Map floating controls moved to the top toolbar; in-map UI removed */}
            
            {/* Enhanced plan layers with better selection visuals */}
            {localityId && (
              <Source 
                id="plans-tiles" 
                type="vector" 
                tiles={[`${api.defaults.baseURL?.replace(/\/$/, '')}/zoning/plans/latest/${localityId}/tiles/{z}/{x}/{y}.mvt`]} 
                minzoom={1} 
                maxzoom={22} 
                promoteId="id"
              >
                <Layer
                  id="plans-fill"
                  type="fill"
                  source-layer="zones"
                  paint={{
                    'fill-color': [
                      'case',
                      ['boolean', ['feature-state', 'selected'], false],
                      '#10b981',
                      [
                        'case',
                        ['==', ['literal', colorMode], 'status'],
                        [ 'case', ['to-boolean', ['get', 'can_be_subdivided']], '#10b981', '#9ca3af' ],
                        ['coalesce', ['get', 'color'], '#6b7280']
                      ]
                    ],
                    'fill-opacity': [
                      'case',
                      ['boolean', ['feature-state', 'selected'], false], 0.7,
                      ['boolean', ['feature-state', 'hover'], false], Math.max(0.05, Math.min(1, plansOpacity || 0.6)),
                      Math.max(0.05, Math.min(1, plansOpacity || 0.45)),
                    ],
                  }}
                />
                <Layer
                  id="plans-line"
                  type="line"
                  source-layer="zones"
                  paint={{
                    'line-color': [
                      'case',
                      ['boolean', ['feature-state', 'selected'], false],
                      '#059669',
                      ['boolean', ['feature-state', 'hover'], false],
                      '#374151',
                      '#1f2937',
                    ],
                    'line-width': [
                      'case',
                      ['boolean', ['feature-state', 'selected'], false],
                      3,
                      ['boolean', ['feature-state', 'hover'], false],
                      2,
                      1.5,
                    ],
                    'line-opacity': 0.95,
                  }}
                />
              </Source>
            )}

            {/* Existing locality and parent parcel layers */}
            {localityBoundary && (
              <Source id="locality-boundary" type="geojson" data={localityBoundary}>
                <Layer
                  id="locality-boundary-fill"
                  type="fill"
                  source="locality-boundary"
                  paint={{
                    'fill-color': '#f0f9ff',
                    'fill-opacity': 0.15,
                  }}
                />
                <Layer
                  id="locality-boundary-line"
                  type="line"
                  source="locality-boundary"
                  paint={{
                    'line-color': '#0284c7',
                    'line-width': 2.5,
                    'line-dasharray': [4, 2],
                  }}
                />
              </Source>
            )}

            {parentParcel && (
              <Source id="parent-parcel" type="geojson" data={parentParcel}>
                <Layer
                  id="parcel-fill"
                  type="fill"
                  source="parent-parcel"
                  paint={{ 'fill-color': '#bfdbfe', 'fill-opacity': 0.18 }}
                />
                <Layer
                  id="parcel-line"
                  type="line"
                  source="parent-parcel"
                  paint={{ 'line-color': '#2563eb', 'line-width': 2 }}
                />
              </Source>
            )}
          </MapGL>
        </div>

        

        {/* Existing UI elements */}
        {isMaximized && (
          <div className="absolute left-3 top-3 z-50">
            <button
              type="button"
              onClick={() => {
                try { window.dispatchEvent(new CustomEvent('subdivision:toggle-fullscreen')); } catch {}
                try { onToggleFullscreen?.(); } catch {}
              }}
              className="bg-white/90 text-foreground rounded-full p-2 shadow"
              title="Exit full screen"
            >
              <Minimize className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mobile floating panel toggles */}
        <div className="md:hidden">
          <div className="absolute left-3 bottom-6 z-50">
            <button
              type="button"
              onClick={() => useSubdivisionStore.getState().setLeftPanelOpen(true)}
              className="bg-background/90 text-foreground rounded-full p-2 shadow"
              aria-label="Open left panel"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute right-3 bottom-6 z-50">
            <button
              type="button"
              onClick={() => useSubdivisionStore.getState().setRightPanelOpen(true)}
              className="bg-background/90 text-foreground rounded-full p-2 shadow"
              aria-label="Open right panel"
            >
              <PanelRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Measurement Panel */}
        <div className="absolute inset-0 pointer-events-none">
          <MeasurePanel />
        </div>
      </div>

      {/* Points Dialog */}
      {pointsOpen && (
        <PointDialog
          isOpen={pointsOpen}
          onOpenChange={handlePointsOpenChange}
          onConfirm={handlePointsConfirm}
        />
      )}
    </div>
  );
}
