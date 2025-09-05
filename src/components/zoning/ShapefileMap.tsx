import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import { MapLayer } from './MapLayer';
import { LayerControl } from './LayerControl';
import { FeatureInfoPanel } from './FeatureInfoPanel';
import { generateLayerColors, calculateBounds } from '@/utils/zoningUtils';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useLocalityShapefileQuery } from '@/queries/useLocalityQuery';
import 'mapbox-gl/dist/mapbox-gl.css';

import type {
  GeoJSONFeatureType,
  MapLayerType,
  ShapefileMapPropsType,
  ViewportStateType
} from '@/types/zoning';
import { useThemeStore } from '@/store/themeStore';

const DEFAULT_VIEWPORT = {
  longitude: 39.2083,
  latitude: -6.369,
  zoom: 5,
};

export const ShapefileMap: React.FC<ShapefileMapPropsType> = ({
  baseMapId,
  overlayMapsIds = [],
  mapboxAccessToken = "pk.eyJ1IjoiY3Jlc2NlbnRzYW1iaWxhIiwiYSI6ImNtZWx5ZXR4OTA5Y3gyanNkOHM0cjFtN2sifQ.RC22kROvjoVE5LdsCSPSsA",
  initialViewport = {},
  mapboxStyle,
  showLayersControl = true,
  resetKey,
}) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const [layers, setLayers] = useState<MapLayerType[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeatureType | null>(null);
  const [baseMapBounds, setBaseMapBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [viewport, setViewport] = useState<ViewportStateType>({
    ...DEFAULT_VIEWPORT,
    ...initialViewport,
  });

  const mapRef = useRef<any>(null);
  const colors = useMemo(() => generateLayerColors(), []);

  // Load base map shapefile
  const {
    data: baseMapData,
    isLoading: baseMapLoading,
    error: baseMapError,
  } = useLocalityShapefileQuery(baseMapId);

  // Load overlay maps
  const overlayQueries = overlayMapsIds.map((id, index) => {
    const { data, isLoading, error } = useLocalityShapefileQuery(id);
    return { id, data, isLoading, error, index };
  });

  useEffect(() => {
    setLayers([]);
    setSelectedFeature(null);
    setBaseMapBounds(null);
    setViewport({
      ...DEFAULT_VIEWPORT,
      ...initialViewport,
    });
  }, [resetKey]);

  // Add base map to layer list
  useEffect(() => {
    if (!baseMapData) return;

    const baseLayer: MapLayerType = {
      id: `base-${baseMapId}`,
      name: baseMapData.name || baseMapData.features?.[0]?.properties?.name || 'Base Map',
      data: baseMapData,
      visible: true,
      editable: false,
      isBase: true,
      color: colors[0],
      opacity: 0.3,
    };

    setLayers(prev => {
      const withoutBase = prev.filter(l => !l.isBase);
      return [baseLayer, ...withoutBase];
    });

    const bounds = calculateBounds([baseLayer]);
    if (bounds && mapRef.current) {
      setBaseMapBounds(bounds);
      mapRef.current.fitBounds([
        [bounds[0][0], bounds[0][1]],
        [bounds[1][0], bounds[1][1]]
      ], {
        padding: 20,
        duration: 1000,
      });
    }
  }, [baseMapData, baseMapId, colors]);

  // Add overlays when loaded
  useEffect(() => {
    const newLayers: MapLayerType[] = [];

    overlayQueries.forEach(({ id, data, isLoading, error, index }) => {
      if (isLoading || error || !data) return;

      const exists = layers.find(l => l.id === `overlay-${id}-${index}`);
      if (exists) return;

      newLayers.push({
        id: `overlay-${id}-${index}`,
        name: data.name || data.features?.[0]?.properties?.name || `Overlay ${index + 1}`,
        data,
        visible: true,
        editable: true,
        isBase: false,
        color: colors[(index + 1) % colors.length],
        opacity: 0.4,
      });
    });

    if (newLayers.length > 0) {
      setLayers(prev => [...prev, ...newLayers]);
    }
  }, [overlayQueries, colors, layers]);

  const handleMapClick = useCallback(
    (event: any) => {
      const features = mapRef.current?.queryRenderedFeatures(event.point);
      const clicked = features?.find((f: any) =>
        layers.some(layer => layer.id === f.source && layer.visible)
      );
      setSelectedFeature(clicked || null);
    },
    [layers]
  );

  const handleViewportChange = useCallback(
    (e: any) => {
      let newViewport = e.viewState;
      if (baseMapBounds && newViewport.zoom < 4) {
        newViewport = { ...newViewport, zoom: 4 };
      }
      setViewport(newViewport);
    },
    [baseMapBounds]
  );

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(prev =>
      prev.map(l => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  }, []);

  const exportLayer = useCallback((id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer?.data) return;

    const blob = new Blob([JSON.stringify(layer.data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layer.name.replace(/\s+/g, '_')}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [layers]);

  const visibleLayers = useMemo(() => layers.filter(l => l.visible), [layers]);

  const resolvedMapboxStyle = mapboxStyle ?? (isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v11');

  // Loading states
  const isAnyOverlayLoading = overlayQueries.some(q => q.isLoading);
  const overlayErrors = overlayQueries.filter(q => q.error);

  if (baseMapError) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-2" size={24} />
          <div className="font-medium">Error loading base map</div>
          <div className="text-sm">{baseMapError.message}</div>
        </div>
      </div>
    );
  }

  if (baseMapLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white rounded">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-2" size={24} />
          <div className="text-sm">Loading base map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Map */}
      <Map
        ref={mapRef}
        {...viewport}
        style={{ width: '100%', height: '100%' }}
        onMove={handleViewportChange}
        onClick={handleMapClick}
        mapStyle={resolvedMapboxStyle}
        mapboxAccessToken={mapboxAccessToken}
        interactiveLayerIds={visibleLayers.map(l => l.id)}
        maxZoom={20}
        minZoom={baseMapBounds ? 4 : 1}
      >
        <NavigationControl position="top-left" />
        {visibleLayers.map(layer => (
          <MapLayer key={layer.id} layer={layer} />
        ))}
      </Map>
      
      {/* Layers Control */}
      {showLayersControl && (
        <LayerControl
          layers={layers}
          onToggleLayer={toggleLayerVisibility}
          onExportLayer={exportLayer}
        />
      )}

      {/* Feature Info */}
      <FeatureInfoPanel
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />

      {/* Overlay Loading Indicator */}
      {isAnyOverlayLoading && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-70 px-3 py-2 rounded-lg shadow z-30">
          <Loader2 className="animate-spin text-blue-600" size={18} />
          <span className="text-sm text-gray-700 dark:text-white">Loading localities…</span>
        </div>
      )}

      {/* Overlay Errors */}
      {overlayErrors.length > 0 && (
        <div className="absolute bottom-16 right-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 text-sm px-3 py-2 rounded shadow z-30">
          {overlayErrors.length} overlay(s) failed to load.
        </div>
      )}
    </div>
  );
};
