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
import { 
  polygonToLine, 
  polygonize, 
  length as turfLength, 
  area as turfArea, 
  intersect as turfIntersect,
} from '@turf/turf';
import { featureCollection as turfFeatureCollection } from '@turf/helpers';
import MeasurePanel from '../MeasurePanel';
import PointDialog from './PointDialog';
import createToolbox from '../tools/toolbox';
import { Minimize, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlansQuery } from '@/queries/usePlansQuery';

// ============================================================================
// IMPORTS: Extracted utilities and hooks
// ============================================================================
import { 
  fcToBounds, 
  extractCoordinatesFromGeometry, 
  calculateBoundsFromFeature, 
  calculateAreaFromBounds, 
  getZoomPaddingForArea 
} from '../utils/geometryHelpers';
import { calculateUTM, convertCoordinates } from '../utils/projectionHelpers';
import { getPlansTilesTemplate, isApiUrl, invalidateTiles } from '../utils/tilesHelpers';

// Custom hooks
import { useZoomToFeature } from '../hooks/useZoomToFeature';
import { usePlanInteraction } from '../hooks/usePlanInteraction';
import { useLocalityBoundary } from '../hooks/useLocalityBoundary';
import { useMapRequestTransform } from '../hooks/useMapRequestTransform';
import { useMapStyle, useMapLabelVisibility, useMapPaintProperties } from '../hooks/useMapStyleEffects';
import { useCreateSubdivision } from '../hooks/useCreateSubdivision';
import { usePlanSummaries } from '../hooks/usePlanSummaries';
import { useTileErrorHandler } from '../hooks/useTileErrorHandler';
import { useZoneSelectionSync } from '../hooks/useZoneSelectionSync';

// Layer components
import { PlansLayers } from './PlansLayers';
import { LocalityLayers } from './LocalityLayers';
import { ParcelLayers } from './ParcelLayers';

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

export default function SubdivisionMapViewer({ 
  parentParcel, 
  localityId,
  isMaximized,
  onToggleFullscreen,
}: SubdivisionMapViewerProps) {
  // ============================================================================
  // QUERIES & REFS
  // ============================================================================
  const plansQuery = usePlansQuery(localityId ? { locality: localityId } : null as any);
  const mapRef = useRef<MapRef | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  // ============================================================================
  // LOCAL STATE
  // ============================================================================
  const pointsOpen = useSubdivisionStore((s) => s.pointsDialogOpen);
  const setPointsOpen = useSubdivisionStore((s) => s.setPointsDialogOpen);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // ============================================================================
  // BACKEND DATA
  // ============================================================================
  const { data: backendSubdivisions = [] } = useParcelSubdivisionsQuery(
    parentParcel?.properties.id
  );

  // ============================================================================
  // STORE SELECTORS
  // ============================================================================
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

  // ============================================================================
  // STORE ACTIONS
  // ============================================================================
  const setMap = useSubdivisionStore((s) => s.setMap);
  const setIsDrawing = useSubdivisionStore((s) => s.setIsDrawing);
  const setDrawMode = useSubdivisionStore((s) => s.setDrawMode);
  const addSubdivision = useSubdivisionStore((s) => s.addSubdivision);
  const updateSubdivisions = useSubdivisionStore((s) => s.updateSubdivisions);
  const setSelectedId = useSubdivisionStore((s) => s.setSelectedId);
  const setActivePlan = useSubdivisionStore((s) => s.setActivePlan);

  // ============================================================================
  // EXTRACTED CUSTOM HOOKS
  // ============================================================================
  
  const { localityBoundary, localityBounds } = useLocalityBoundary(localityId);
  
  const getMap = useCallback((): MapboxMap | MapRef | null => {
    return mapRef.current?.getMap?.() || mapRef.current;
  }, []);

  const transformRequest = useMapRequestTransform();
  const zoomToFeature = useZoomToFeature(getMap);
  
  const { handlePlanClick, handleMapMouseMove, handleMapDoubleClick, handleMapRightClick } = 
    usePlanInteraction(getMap, isDrawing, zoomToFeature);

  const createSubdivisionFeature = useCreateSubdivision(selectedPlan, parentParcel);
  
  const { recomputePlans, updatePlanSummariesFromMap, applySelectionToMap } = 
    usePlanSummaries(getMap, localityId);

  // Apply style and paint effects
  useMapStyle(getMap, styleName);
  useMapLabelVisibility(getMap, labelsVisible);
  useMapPaintProperties(getMap, { showPlans, parcelOpacity, boundaryGlow });
  
  // Sync zone selections
  useZoneSelectionSync(getMap, selectedZoneIds);
  
  // Handle tile errors
  useTileErrorHandler(getMap, () => getPlansTilesTemplate(localityId));

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const handleMapLoad = useCallback(() => {
    if (!mapRef.current) return;
    const mapInstance = mapRef.current.getMap();
    
    // Enhanced interaction settings
    mapInstance.boxZoom.enable();
    mapInstance.scrollZoom.enable();
    mapInstance.dragRotate.enable();
    mapInstance.dragPan.enable();
    mapInstance.keyboard.enable();
    mapInstance.doubleClickZoom.enable();
    mapInstance.touchZoomRotate.enable();
    
    mapInstance.scrollZoom.setWheelZoomRate(1 / 450);
    mapInstance.scrollZoom.setZoomRate(0.1);
    
    setMap(mapInstance);
    
    // Remove existing draw control if any
    if (drawRef.current) {
      mapInstance.removeControl(drawRef.current);
      drawRef.current = null;
    }
    
    // Initialize draw tools
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
    
    mapInstance.addControl(draw);
    drawRef.current = draw;
    
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
    
    if (localityBounds) {
      try {
        mapInstance.fitBounds(localityBounds, { padding: 80, duration: 700 });
      } catch {}
    }
    
    // Enhanced draw event handlers
    const onCreate = (e: any) => {
      const features = e.features || [];
      
      features.forEach((f: any) => {
        const drawId = f.id || String(Date.now());
        
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
        
        const feature = createSubdivisionFeature(f.geometry, drawId);
        addSubdivision(feature);
        
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
    
    const onDelete = (e: any) => {
      const features = e.features || [];
      if (!features.length) return;
      
      const ids = features.map((f: any) => f.id);
      updateSubdivisions((prev) => 
        prev.filter((sub) => !ids.includes(sub.properties?._drawId))
      );
    };
    
    const onMapClick = (ev: any) => {
      try {
        const inspectorOpen = useSubdivisionStore.getState().inspectorOpen;
        if (!inspectorOpen) return;
        
        const features = mapInstance.queryRenderedFeatures(ev.point);
        const feature = features?.[0];
        const id = feature?.properties?.id || feature?.properties?._drawId;
        
        if (id) {
          useSubdivisionStore.getState().setSelectedId(id);
        }
      } catch {}
    };
    
    const handleDrawModeChange = ({ mode }: { mode: string }) => {
      const container = mapRef.current?.getContainer();
      if (!container) return;
      
      if (mode === 'simple_select' || mode === 'direct_select') {
        container.style.cursor = 'default';
        setIsDrawing(false);
      } else if (mode.startsWith('draw_')) {
        container.style.cursor = 'crosshair';
        setIsDrawing(true);
      }
    };
    
    mapInstance.on('draw.create', onCreate);
    mapInstance.on('draw.update', onUpdate);
    mapInstance.on('draw.delete', onDelete);
    mapInstance.on('draw.modechange', handleDrawModeChange);
    mapInstance.on('click', onMapClick);
    
    (drawRef as any).currentCleanup = () => {
      try {
        mapInstance.off('draw.create', onCreate);
        mapInstance.off('draw.update', onUpdate);
        mapInstance.off('draw.delete', onDelete);
        mapInstance.off('draw.modechange', handleDrawModeChange); 
        mapInstance.off('click', onMapClick);
        mapInstance.removeControl(draw);
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

  // ============================================================================
  // EFFECTS: Drawing mode and fullscreen
  // ============================================================================

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    
    if (!isDrawing) {
      try {
        draw.changeMode('simple_select');
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

  useEffect(() => {
    return () => {
      try {
        (drawRef as any).currentCleanup?.();
      } catch {}
    };
  }, []);

  // ============================================================================
  // EFFECTS: Zoom and auto-load
  // ============================================================================

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

  useEffect(() => {
    const m = getMap();
    if (!m || !localityBounds) return;

    try {
      m.fitBounds(localityBounds, { padding: 80, duration: 700 });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // EFFECTS: Map interaction listeners
  // ============================================================================

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

  // ============================================================================
  // EFFECTS: Toolbox registration and cleanup
  // ============================================================================

  useEffect(() => {
    const toolbox = createToolbox({
      mapRef,
      drawRef,
      recomputePlans,
      zoomToFeature,
      getPlansTilesTemplate: () => getPlansTilesTemplate(localityId),
      getLocalityBounds: () => localityBounds,
    });

    useSubdivisionStore.getState().setAPI(toolbox as any);
    return () => {
      try { useSubdivisionStore.getState().setAPI({}); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recomputePlans, zoomToFeature, localityBounds]);

  // ============================================================================
  // EFFECTS: Responsive resize
  // ============================================================================

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

  // ============================================================================
  // EFFECTS: Tile refresh and locality changes
  // ============================================================================

  useEffect(() => {
    const m = getMap();
    if (!m) return;
    
    try {
      if (m.isStyleLoaded?.() && m.getSource && m.getSource('plans-tiles')) {
        const template = getPlansTilesTemplate(localityId);
        if (template) {
          invalidateTiles(m, 'plans-tiles');
        }
      }
    } catch {}
  }, [localityId, getMap]);

  // ============================================================================
  // HANDLER: Points dialog confirmation
  // ============================================================================

  const handlePointsConfirm = useCallback((points: PointRow[], mode: CoordMode, epsg?: string) => {
    if (points.length < 3) {
      toast.error('Need at least 3 points to create a polygon');
      return;
    }
    
    const convertedPoints: MapPoint[] = points.map((point): MapPoint | null => {
      if (mode === 'wgs84') {
        return { lng: Number(point.a), lat: Number(point.b) };
      } else if (epsg && mode === 'projected') {
        try {
          const result = convertCoordinates(Number(point.a), Number(point.b), epsg, 'EPSG:4326');
          if (result) {
            return { lng: result[0], lat: result[1] };
          }
        } catch (err) {
          toast.error(`Failed to convert coordinates: ${err}`);
        }
        return null;
      } else {
        toast.error('EPSG code required for projected coordinates');
        return null;
      }
    }).filter((p): p is MapPoint => p !== null);

    if (convertedPoints.length < 3) {
      toast.error('Failed to convert some coordinates. Need at least 3 valid points.');
      return;
    }

    const coordinates = [
      [
        ...convertedPoints.map(p => [p.lng, p.lat]),
        [convertedPoints[0].lng, convertedPoints[0].lat]
      ]
    ];

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
        size: 0,
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
  }, [parentParcel, addSubdivision, setPointsOpen, setDrawMode, setIsDrawing, selectedPlan]);

  const handlePointsOpenChange = useCallback((newOpen: boolean) => {
    setPointsOpen(newOpen);
    if (!newOpen) {
      setDrawMode(null);
      setIsDrawing(false);
    }
  }, [setDrawMode, setIsDrawing, setPointsOpen]);

  // ============================================================================
  // RENDER
  // ============================================================================

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
            
            {/* Map Layers */}
            <PlansLayers 
              localityId={localityId}
              plansOpacity={plansOpacity}
              colorMode={colorMode}
              showPlans={showPlans}
            />

            <LocalityLayers localityBoundary={localityBoundary} />

            <ParcelLayers parentParcel={parentParcel} />
          </MapGL>
        </div>

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
