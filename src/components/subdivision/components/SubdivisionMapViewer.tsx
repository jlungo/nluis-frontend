import { type ParcelFeature, type SubdivisionFeature } from '@/types/subdivision';
import { useParcelSubdivisionsQuery } from '@/queries/useParcelQuery';
import React, { useRef, useEffect, useCallback, useState } from 'react';
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
import api, { getAccessToken } from '@/lib/axios';
import { usePlanDetailQuery } from '@/queries/usePlansQuery';
import proj4 from 'proj4';
import { 
  centroid, 
  polygonToLine, 
  polygonize, 
  length as turfLength, 
  area as turfArea, 
  intersect as turfIntersect 
} from '@turf/turf';
import { featureCollection } from '@turf/helpers';
import MeasurePanel from '../MeasurePanel';
import PointDialog from './PointDialog';
import { Menu, PanelRight, Minimize, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubdivisionMapViewerProps {
  parentParcel?: ParcelFeature;
  disabled?: boolean;
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

export default function SubdivisionMapViewer({ 
  parentParcel, 
  disabled, 
  localityId,
  isMaximized,
  onToggleFullscreen,
}: SubdivisionMapViewerProps) {
  // Refs
  const mapRef = useRef<MapRef | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const prevHoverRef = useRef<string | number | null>(null);

  // Local state (not derived from store)
  const [pointsOpen, setPointsOpen] = useState(false);
  const [, setViewState] = useState(INITIAL_VIEW_STATE);
  const [devTileUrl, setDevTileUrl] = useState<string | null>(null);
  const [devPlansCount, setDevPlansCount] = useState<number>(0);
  const [localityBoundary, setLocalityBoundary] = useState<any>(null);

  // Backend data
  const { data: backendSubdivisions = [] } = useParcelSubdivisionsQuery(
    parentParcel?.properties.id
  );
  // Store selectors - use shallow comparison for primitive values
  const styleName = useSubdivisionStore((s) => s.styleName);
  const labelsVisible = useSubdivisionStore((s) => s.labelsVisible);
  const showPlans = useSubdivisionStore((s) => s.showPlans);
  const parcelOpacity = useSubdivisionStore((s) => s.parcelOpacity);
  const boundaryGlow = useSubdivisionStore((s) => s.boundaryGlow);
  const isDrawing = useSubdivisionStore((s) => s.isDrawing);
  const drawMode = useSubdivisionStore((s) => s.drawMode);
  const selectedId = useSubdivisionStore((s) => s.selectedId);
  const activePlanId = useSubdivisionStore((s) => s.activePlanId);

  // Store actions - stable references
  const setMap = useSubdivisionStore((s) => s.setMap);
  const setIsDrawing = useSubdivisionStore((s) => s.setIsDrawing);
  const setDrawMode = useSubdivisionStore((s) => s.setDrawMode);
  const addSubdivision = useSubdivisionStore((s) => s.addSubdivision);
  const updateSubdivisions = useSubdivisionStore((s) => s.updateSubdivisions);
  const togglePlan = useSubdivisionStore((s) => s.togglePlan);
  const setSelectedId = useSubdivisionStore((s) => s.setSelectedId);
  const setActivePlan = useSubdivisionStore((s) => s.setActivePlan);

  // Fetch plan detail only when needed. If no explicit activePlanId but a localityId is set,
  // fetch the latest plan for that locality.
  const planDetailArg = activePlanId ?? (localityId ? { locality: localityId } : undefined);
  const { data: activePlanDetail } = usePlanDetailQuery(planDetailArg as any);

  // Fetch locality boundary for base map
  useEffect(() => {
    if (!localityId) {
      setLocalityBoundary(null);
      return;
    }

    const fetchBoundary = async () => {
      try {
        const response = await api.get(`/localities/localities/${localityId}/boundary/`);
        setLocalityBoundary(response.data);
      } catch (error) {
        console.error('Failed to fetch locality boundary:', error);
        setLocalityBoundary(null);
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

  // Plan hover handler - stable callback
  const handleMapMouseMove = useCallback((e: any) => {
    const m = getMap();
    if (!m) return;
    
    try {
  const features = m.queryRenderedFeatures(e.point, { layers: ['plans-fill'] }) || [];
      const id = features[0]?.id ?? features[0]?.properties?.id ?? null;
      
      if (prevHoverRef.current && prevHoverRef.current !== id) {
        try {
          m.setFeatureState(
            { source: 'plans-tiles', sourceLayer: 'zones', id: prevHoverRef.current },
            { hover: false }
          );
        } catch {}
        prevHoverRef.current = null;
      }
      
      if (id && id !== prevHoverRef.current) {
        try {
          m.setFeatureState(
            { source: 'plans-tiles', sourceLayer: 'zones', id },
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
  }, [getMap]);

  // Plan click handler - stable callback
  const handleMapClick = useCallback((e: any) => {
    const m = getMap();
    if (!m) return;
    
    try {
  const features = m.queryRenderedFeatures(e.point, { layers: ['plans-fill'] }) || [];
      if (!features.length) return;
      
      const feature = features[0];
      const fid = String(
        feature.id ??
        feature.properties?.id ??
        feature.properties?.pk ??
        feature.properties?.plan_id ??
        ''
      );
      
      if (!fid) return;
      
  togglePlan(fid);
  setSelectedId(fid);
  setActivePlan(fid);
      
      try {
        m.setFeatureState(
          { source: 'plans-tiles', sourceLayer: 'zones', id: fid },
          { selected: true }
        );
      } catch {}
      
      // Zoom to feature bounds
      const geom = feature.geometry || feature.properties?.geometry;
      if (geom && 'coordinates' in geom) {
        const coords: [number, number][] = [];
        const collectCoords = (c: any): void => {
          if (typeof c[0] === 'number') {
            coords.push([c[0], c[1]]);
            return;
          }
          c.forEach(collectCoords);
        };
        
        if (geom.type === 'Polygon') {
          collectCoords(geom.coordinates);
        } else if (geom.type === 'MultiPolygon') {
          geom.coordinates.forEach(collectCoords);
        }
        
        if (coords.length) {
          const lons = coords.map((p) => p[0]);
          const lats = coords.map((p) => p[1]);
          try {
            m.fitBounds(
              [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
              { padding: 80, duration: 600 }
            );
          } catch {}
        }
      }
    } catch {}
  }, [getMap, togglePlan, setSelectedId, setActivePlan]);

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
    m.on('click', handleMapClick);
    
    return () => {
      try {
        m.off('mousemove', handleMapMouseMove);
        m.off('click', handleMapClick);
      } catch {}
    };
  }, [getMap, handleMapMouseMove, handleMapClick]);

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

  // Auto-zoom helper: attempt to zoom to activePlanDetail or to first plan feature
  const autoZoomToPlans = useCallback(() => {
    const m = getMap();
    if (!m) return;

    try {
      if (activePlanDetail?.geometry) {
        const coords: [number, number][] = [];
        const collect = (g: any) => {
          if (g.type === 'Polygon') {
            g.coordinates[0].forEach((c: any) => coords.push([c[0], c[1]]));
          } else if (g.type === 'MultiPolygon') {
            g.coordinates.forEach((poly: any) => poly[0].forEach((c: any) => coords.push([c[0], c[1]])));
          }
        };
        collect(activePlanDetail.geometry);
        if (coords.length) {
          const lons = coords.map((p) => p[0]);
          const lats = coords.map((p) => p[1]);
          m.fitBounds([[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]], { padding: 80, duration: 700 });
          return;
        }
      }

      const feats = recomputePlans();
      if (feats && feats.length) {
        // prefer activePlanId
        const chosen = activePlanId ? feats.find((f: any) => String(f.id) === String(activePlanId) || String(f.properties?.id) === String(activePlanId)) : feats[0];
        const feature = chosen || feats[0];
        const geom = feature.geometry || feature.properties?.geometry;
        if (geom && 'coordinates' in geom) {
          const coords: [number, number][] = [];
          const collectCoords = (c: any): void => {
            if (typeof c[0] === 'number') {
              coords.push([c[0], c[1]]);
              return;
            }
            c.forEach(collectCoords);
          };
          if (geom.type === 'Polygon') collectCoords(geom.coordinates);
          else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(collectCoords);
          if (coords.length) {
            const lons = coords.map((p) => p[0]);
            const lats = coords.map((p) => p[1]);
            m.fitBounds([[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]], { padding: 80, duration: 700 });
            return;
          }
        }
      }

      // fallback to parent parcel bounds
      if (parentParcel?.geometry?.coordinates) {
        const coords = parentParcel.geometry.coordinates[0][0] || parentParcel.geometry.coordinates[0];
        if (coords && coords.length) {
          const lons = coords.map((c: any) => c[0]);
          const lats = coords.map((c: any) => c[1]);
          m.fitBounds(
            [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
            { padding: 80, duration: 700 }
          );
        }
      }
    } catch {}
  }, [getMap, recomputePlans, activePlanDetail, activePlanId, parentParcel]);

  // Listen for source/tile load events so we can recompute plans and auto-zoom when tiles arrive
  useEffect(() => {
    const m = getMap();
    if (!m) return;

    const onSourceData = (e: any) => {
      try {
        if (import.meta.env.DEV) console.debug('[Subdivision] sourcedata event', e);
        if (e?.sourceId === 'plans-tiles' || e?.source === 'plans-tiles') {
          // recompute and auto-zoom when plan tiles load
          recomputePlans();
          autoZoomToPlans();
        }
      } catch {}
    };

    const onIdle = () => {
      try { recomputePlans(); } catch {}
    };

    // Listen for a variety of data/movement events (idle/moveend/data) similar to zoning MapEngine
    m.on('sourcedata', onSourceData);
    m.on('data', onSourceData);
    m.on('idle', onIdle);
    m.on('moveend', onIdle);
    return () => {
      try {
        m.off('sourcedata', onSourceData);
        m.off('data', onSourceData);
        m.off('idle', onIdle);
        m.off('moveend', onIdle);
      } catch {}
    };
  }, [getMap, recomputePlans, autoZoomToPlans]);

  // Update dev overlay state when plans recomputed
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const template = getPlansTilesTemplate();
    setDevTileUrl(template);
    try {
      const feats = recomputePlans();
      setDevPlansCount(feats?.length || 0);
    } catch {
      setDevPlansCount(0);
    }
  }, [getPlansTilesTemplate, recomputePlans, localityId]);

  // Tile error handler & refresh (attach to map once)
  useEffect(() => {
    const m = getMap();
    if (!m) return;

    const onError = async (e: any) => {
      if (import.meta.env.DEV) console.debug('[Subdivision] map error event', e);
      const status = e?.error?.status || e?.error?.cause?.status;

      // 401: try token refresh and cache-bust
      if (status === 401) {
        try {
            if (import.meta.env.DEV) console.debug('[Subdivision] 401 tile error - attempting refresh and cache-bust');
          const { refreshAccessToken } = await import('@/lib/axios');
          await refreshAccessToken();
          const src: any = m.getSource('plans-tiles');
          if (src?.setTiles) {
            const template = getPlansTilesTemplate();
            const [base] = (template || '').split('?');
            src.setTiles([`${base}?v=${Date.now()}`]);
          } else {
            m.triggerRepaint?.();
          }
        } catch {}
        return;
      }

      // Zoning approach: only handle 401 (refresh token & cache-bust). Do not attempt 404 parent-zoom fallbacks here.
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
      
      if (found?.geometry?.coordinates?.[0]?.[0]) {
        const coords = found.geometry.coordinates[0][0];
        const lngs = coords.map((c: any) => c[0]);
        const lats = coords.map((c: any) => c[1]);
        const bbox: [[number, number], [number, number]] = [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)]
        ];
        m.fitBounds(bbox, { padding: 80, duration: 700 });
      }
    } catch {}
  }, [selectedId, getMap]);

  // Auto-zoom when active plan detail is available or when parent parcel is provided
  useEffect(() => {
    const m = getMap();
    if (!m) return;

    try {
      if (activePlanDetail?.geometry) {
        // Build coords from geometry bounding box
        const coords: [number, number][] = [];
        const collect = (g: any) => {
          if (g.type === 'Polygon') {
            g.coordinates[0].forEach((c: any) => coords.push([c[0], c[1]]));
          } else if (g.type === 'MultiPolygon') {
            g.coordinates.forEach((poly: any) => poly[0].forEach((c: any) => coords.push([c[0], c[1]])));
          }
        };

        collect(activePlanDetail.geometry);

        if (coords.length) {
          const lons = coords.map((p) => p[0]);
          const lats = coords.map((p) => p[1]);
          m.fitBounds(
            [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
            { padding: 80, duration: 700 }
          );
          return;
        }
      }

      // Fallback: zoom to parent parcel bounds if provided
      if (parentParcel?.geometry?.coordinates) {
        const coords = parentParcel.geometry.coordinates[0][0] || parentParcel.geometry.coordinates[0];
        if (coords && coords.length) {
          const lons = coords.map((c: any) => c[0]);
          const lats = coords.map((c: any) => c[1]);
          m.fitBounds(
            [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
            { padding: 80, duration: 700 }
          );
        }
      }
    } catch {}
  }, [activePlanDetail, parentParcel, getMap]);

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
  }, [getMap]);

  // Expose subdivision API to store
  useEffect(() => {
    const draw = drawRef.current;
    const map = mapRef.current?.getMap();
    
    // Initialize API with methods that don't depend on map/draw first
  const api = {
      startSelect: () => {
        if (!draw || !map) return;
        try {
          draw.changeMode('simple_select');
          setDrawMode(null);
          setIsDrawing(false);
          const canvas = map.getCanvas();
          if (canvas) canvas.style.cursor = 'pointer';
        } catch (err) {
          console.error('Failed to start select mode:', err);
        }
      },
      startDrawPolygon: () => {
        console.log('startDrawPolygon API method called', {
          hasDraw: !!draw,
          hasMap: !!map
        });
        if (!draw || !map) {
          console.error('Missing draw or map refs');
          return;
        }
        try {
          draw.changeMode('draw_polygon');
          setDrawMode('polygon');
          setIsDrawing(true);
          const canvas = map.getCanvas();
          if (canvas) canvas.style.cursor = 'crosshair';
          console.log('Successfully started polygon mode');
        } catch (err) {
          console.error('Failed to start polygon mode:', err);
        }
      },
      startDrawLine: () => {
        if (!draw || !map) return;
        try {
          draw.changeMode('draw_line_string');
          setDrawMode('line');
          setIsDrawing(true);
          const canvas = map.getCanvas();
          if (canvas) canvas.style.cursor = 'crosshair';
        } catch (err) {
          console.error('Failed to start line mode:', err);
        }
      },
      startDrawPoint: () => {
        if (!draw || !map) return;
        try {
          draw.changeMode('draw_point');
          setDrawMode('point');
          setIsDrawing(true);
          const canvas = map.getCanvas();
          if (canvas) canvas.style.cursor = 'crosshair';
        } catch (err) {
          console.error('Failed to start point mode:', err);
        }
      },
      openAddPoints: () => {
        console.log('openAddPoints called, setting pointsOpen to true');
        setDrawMode(null);
        setIsDrawing(false);
        setPointsOpen(true);
        console.log('Current pointsOpen state:', pointsOpen);
      },
      toggleLabels: (v?: boolean) => {
        const newValue = typeof v === 'boolean' ? v : !labelsVisible;
        useSubdivisionStore.getState().setLabelsVisible(newValue);
      },
      setLabelField: (f: string | null) => {
        useSubdivisionStore.getState().setLabelField(f || '');
      },
      selectAll: () => useSubdivisionStore.getState().selectAll(),
      deselectAll: () => useSubdivisionStore.getState().deselectAll(),
      saveToAPI: async () => {
        const subs = useSubdivisionStore.getState().subdivisions || [];
        console.debug('Subdivision api.saveToAPI called - noop stub', subs.length);
        return { ok: true };
      },
      // Plans helpers
      getPlans: () => recomputePlans(),
      getPlansCount: () => recomputePlans().length,
      refreshPlans: () => {
        const m = mapRef.current?.getMap?.();
        if (!m) return;
        try {
          const src: any = m.getSource('plans-tiles');
          if (src?.setTiles) {
            const template = getPlansTilesTemplate();
            const [base] = (template || '').split('?');
            src.setTiles([`${base}?v=${Date.now()}`]);
          } else {
            m.triggerRepaint();
          }
        } catch {}
      },
      autoZoomToPlans: () => {
        try { autoZoomToPlans(); } catch {}
      },
    };
    
    const currentApi = useSubdivisionStore.getState().api;
    const plansPreview = recomputePlans();
    console.log('API Registration:', {
      isInitialSetup: !currentApi,
      methods: Object.keys(api),
      hasDrawRef: !!drawRef.current,
      hasMapRef: !!mapRef.current,
      plansPreviewCount: plansPreview.length,
    });
    useSubdivisionStore.getState().setAPI(api);
    return () => {
      console.log('Cleaning up API');
      useSubdivisionStore.getState().setAPI(undefined);
    };
  }, [setIsDrawing, setDrawMode, labelsVisible, drawRef, mapRef]);

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
  const src: any = m.getSource('plans-tiles');
      if (src?.setTiles) {
        const template = getPlansTilesTemplate();
        src.setTiles([`${template}&v=${Date.now()}`]);
      } else {
        m.triggerRepaint?.();
      }
    } catch {}
  }, [localityId, getMap, getPlansTilesTemplate]);

  // Auto-zoom to plans tiles when they become available or when activePlanId changes
  useEffect(() => {
    const m = getMap();
    if (!m) return;

    try {
      // Try to get features from the vector source (if accessible)
      let sourceFeatures: any[] = [];
      try {
        sourceFeatures = m.querySourceFeatures?.('plans-tiles', { sourceLayer: 'zones' }) || [];
      } catch {}

      if (!sourceFeatures.length) {
        // If no source features, try rendered features from the layer
        try {
          sourceFeatures = m.queryRenderedFeatures?.({ layers: ['plans-fill'] }) || [];
        } catch {}
      }

      if (!sourceFeatures.length) return;

      // If an activePlanId exists, try to find that feature first
      let chosen: any = null;
      if (activePlanId) {
        chosen = sourceFeatures.find((f: any) => String(f.id) === String(activePlanId) || String(f.properties?.id) === String(activePlanId));
      }

      // Fall back to first available feature
      if (!chosen) chosen = sourceFeatures[0];

      if (!chosen) return;

      const geom = chosen.geometry || chosen.properties?.geometry;
      if (geom && ('coordinates' in geom)) {
        const coords: [number, number][] = [];
        const collectCoords = (c: any): void => {
          if (typeof c[0] === 'number') {
            coords.push([c[0], c[1]]);
            return;
          }
          c.forEach(collectCoords);
        };

        if (geom.type === 'Polygon') collectCoords(geom.coordinates);
        else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(collectCoords);

        if (coords.length) {
          const lons = coords.map((p) => p[0]);
          const lats = coords.map((p) => p[1]);
          m.fitBounds([[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]], { padding: 80, duration: 700 });
        }
      }
    } catch {}
  }, [getMap, localityId, activePlanId, activePlanDetail]);

  // Create subdivision feature with clipping and calculations
  const createSubdivisionFeature = useCallback((geometry: any, drawId: string): SubdivisionFeature => {
    const tempId = `temp_${Date.now()}`;
    let geomToUse = geometry;
    
  // Clip to active plan if set
  if (activePlanId) {
      const map = mapRef.current?.getMap();
      if (map) {
        try {
          let zoneFeat: any = null;
          const sourceFeatures = map.querySourceFeatures('plans-tiles', { sourceLayer: 'zones' }) || [];
          zoneFeat = sourceFeatures.find((z: any) =>
            String(z.id) === String(activePlanId) ||
            String(z.properties?.id) === String(activePlanId)
          );
          
          if (!zoneFeat) {
            const rendered = map.queryRenderedFeatures({ layers: ['plans-fill'] }) || [];
            zoneFeat = rendered.find((z: any) => 
              String(z.id) === String(activePlanId) || 
                String(z.properties?.id) === String(activePlanId)
            );
          }
          
          if (zoneFeat?.geometry) {
            const clipped = turfIntersect(geomToUse, zoneFeat.geometry);
            if (clipped?.geometry) geomToUse = clipped.geometry;
          }
          
          if (activePlanDetail?.geometry) {
            const clipped = turfIntersect(geomToUse, activePlanDetail.geometry);
            if (clipped?.geometry) geomToUse = clipped.geometry;
          }
        } catch {}
      }
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
        allocations: [],
        subdivisionDate: new Date().toISOString(),
        approvalStatus: 'Pending',
        centroid: centroidPt,
        utm,
        _drawId: drawId,
      },
    };
  }, [activePlanId, activePlanDetail, parentParcel, getMap, calculateUTM]);

  // Handle map load and MapboxDraw initialization
  const handleMapLoad = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    
    // Enable default interactions
    map.boxZoom.enable();
    map.scrollZoom.enable();
    map.dragRotate.enable();
    map.dragPan.enable();
    map.keyboard.enable();
    map.doubleClickZoom.enable();
    map.touchZoomRotate.enable();
    
    setMap(map);
    
    // Remove existing draw control if any
    if (drawRef.current) {
      map.removeControl(drawRef.current);
      drawRef.current = null;
    }
    
    // Initialize draw tools with proper configuration
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
        point: true,
        line_string: true,
      },
      // Show active drawing tools above other UI elements
      userProperties: true,
      // Keep drawn features around after creation
      persistentDrawing: true,
      defaultMode: 'simple_select',
      styles: [
        // Point style
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
        // Line style
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
        // Polygon fill style
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
        // Polygon stroke style
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
    
    // Draw event: create
    const onCreate = (e: any) => {
      const features = e.features || [];
      
      features.forEach((f: any) => {
        const drawId = f.id || String(Date.now());
        
        // Handle line splitting
        if (f.geometry?.type === 'LineString' && drawMode === 'line' && parentParcel) {
          try {
            const parentLines = polygonToLine(parentParcel);
            const linesFc = featureCollection([parentLines, f]);
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
              // Remove the measurement line after calculation
              draw.delete(f.id);
            } else if (f.geometry.type === 'Polygon') {
              const a = turfArea(f);
              useSubdivisionStore.getState().setLastMeasurement({
                type: 'area',
                value: a,
                units: 'm²',
              });
              // Remove the measurement polygon after calculation
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
            return; // Don't add to subdivisions in measurement mode
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
    getMap,
    setMap,
    isDrawing,
    drawMode,
    parentParcel,
    createSubdivisionFeature,
    addSubdivision,
    setIsDrawing,
    updateSubdivisions,
  ]);

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
  }, [parentParcel, calculateUTM, addSubdivision, setDrawMode, setIsDrawing]);

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

  // Handle points dialog close
  const handlePointsOpenChange = useCallback((newOpen: boolean) => {
    setPointsOpen(newOpen);
    if (!newOpen) {
      setDrawMode(null);
      setIsDrawing(false);
    }
  }, [setDrawMode, setIsDrawing]);



  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="p-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Map (street view)</h4>
          {/* <div className="text-xs text-muted-foreground">
            Mapbox street map — production-ready
          </div> */}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div>
            Subdivisions: <strong>{backendSubdivisions.length}</strong>
            {disabled ? ' (read-only)' : ''}
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
            interactive
            interactiveLayerIds={["plans-fill"]}
            onMove={({ viewState }) => setViewState(viewState)}
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
            
            {/* Locality Boundary - Base layer */}
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
            
            {/* Plans vector tiles */}
            {(() => {
              if (!localityId) return null;
              // Transform request will handle adding auth headers
              const tileUrl = `${api.defaults.baseURL?.replace(/\/$/, '')}/zoning/plans/latest/${localityId}/tiles/{z}/{x}/{y}.mvt`;
              return (
                <Source 
                  id="plans-tiles" 
                  type="vector" 
                  tiles={[tileUrl]} 
                  minzoom={1} 
                  maxzoom={22} 
                  promoteId="id"
                >
                  <Layer
                    id="plans-fill"
                    type="fill"
                    source-layer="zones"
                    paint={{
                      'fill-color': ['coalesce', ['get', 'color'], '#6b7280'],
                      'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false], 0.85,
                        ['boolean', ['feature-state', 'hover'], false], 0.7,
                        0.45,
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
                        '#111827',
                        '#1f2937',
                      ],
                      'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        2.5,
                        0.75,
                      ],
                      'line-opacity': 0.95,
                    }}
                  />
                </Source>
              );
            })()}

            {/* Auto-zoom to active plan or locality bounds when tiles/features become available */}
            

            {/* Parent parcel overlay */}
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

        {/* Dev-only locality / tiles debug overlay */}
        {import.meta.env.DEV && (
          <div className="absolute left-3 bottom-3 z-50 bg-white/90 p-2 rounded text-xs shadow-sm max-w-xs break-words">
            <div><strong>Resolved localityId:</strong> {String(localityId ?? 'none')}</div>
            <div className="mt-1 break-all"><strong>Tiles URL:</strong> {String(devTileUrl ?? 'n/a')}</div>
            <div className="mt-1"><strong>Plans features (preview):</strong> {devPlansCount}</div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  try { (useSubdivisionStore.getState().api as any)?.refreshPlans?.(); } catch {}
                }}
                className="px-2 py-1 rounded bg-slate-100"
              >
                Refresh tiles
              </button>
              <button
                type="button"
                onClick={() => {
                  try { (useSubdivisionStore.getState().api as any)?.getPlans?.(); (useSubdivisionStore.getState().api as any)?.getPlansCount?.(); } catch {}
                  try { (useSubdivisionStore.getState().api as any)?.autoZoomToPlans?.(); } catch {}
                }}
                className="px-2 py-1 rounded bg-slate-100"
              >
                Force auto-zoom
              </button>
            </div>
          </div>
        )}

        {/* Fullscreen exit button */}
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
              aria-label="Exit fullscreen"
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