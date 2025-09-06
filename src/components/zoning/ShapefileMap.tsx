import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import { MapLayer } from './MapLayer';
import { LayerControl } from './LayerControl';
import { FeatureInfoPanel } from './FeatureInfoPanel';
import { generateLayerColors, calculateBounds } from '@/utils/zoningUtils';
import { AlertCircle } from 'lucide-react';
import { useLocalityShapefileQuery } from '@/queries/useLocalityQuery';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import type {
  GeoJSONFeatureType,
  MapLayerType,
  ShapefileMapPropsType,
  ViewportStateType
} from '@/types/zoning';

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
  mapboxStyle = 'mapbox://styles/mapbox/streets-v11',
}) => {
  const [layers, setLayers] = useState<MapLayerType[]>([]);
  const [loadedOverlayIds, setLoadedOverlayIds] = useState<Set<string>>(new Set());
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeatureType | null>(null);
  const [baseMapBounds, setBaseMapBounds] = useState<[[number, number], [number, number]] | null>(
    null
  );
  const [viewport, setViewport] = useState<ViewportStateType>({
    ...DEFAULT_VIEWPORT,
    ...initialViewport,
  });

  const mapRef = useRef<any>(null);
  const colors = useMemo(() => generateLayerColors(), []);

  // Load base map shapefile using its ID
  const {
    data: baseMapData,
    isLoading: baseMapLoading,
    error: baseMapError,
  } = useLocalityShapefileQuery(baseMapId);

  // Load overlays using individual hook calls for each overlay id
  const overlayQueries = overlayMapsIds.map(id => ({
    id,
    query: useLocalityShapefileQuery(id),
  }));

  // Add base map to layer list
  useEffect(() => {
    if (!baseMapData) return;

    const baseLayer: MapLayerType = {
      id: 'base-map',
      name:
        baseMapData.name ||
        baseMapData.features?.[0]?.properties?.name ||
        'Base Map',
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
    if (bounds) {
      setBaseMapBounds(bounds);
      mapRef.current?.fitBounds([bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]], {
        padding: 20,
        duration: 1000,
      });

      setViewport(prev => ({
        ...prev,
        longitude: (bounds[0][0] + bounds[1][0]) / 2,
        latitude: (bounds[0][1] + bounds[1][1]) / 2,
        zoom: 6,
      }));
    }
  }, [baseMapData, colors]);

  // Add overlays when loaded
  useEffect(() => {
    overlayQueries.forEach(({ id, query }, index) => {
      const { data, error } = query;
      if (!data || loadedOverlayIds.has(id)) return;

      const overlayLayer: MapLayerType = {
        id: `overlay-${id}`,
        name: data.name || data.features?.[0]?.properties?.name || `Overlay ${index + 1}`,
        data,
        visible: true,
        editable: true,
        isBase: false,
        color: colors[(index + 1) % colors.length],
        opacity: 0.4,
      };

      setLayers(prev => [...prev, overlayLayer]);
      setLoadedOverlayIds(prev => new Set(prev).add(id));

      if (error) {
        console.warn(`Error loading overlay ${id}:`, error);
      }
    });
  }, [overlayQueries, colors, loadedOverlayIds]);

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

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
      {baseMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-black dark:bg-opacity-70 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2 mx-auto" />
            <div className="text-sm text-gray-700 dark:text-white">Loading shapefiles...</div>
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        {...viewport}
        style={{ width: '100%', height: '100%' }}
        onMove={handleViewportChange}
        onClick={handleMapClick}
        mapStyle={mapboxStyle}
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
      <LayerControl
        layers={layers}
        onToggleLayer={toggleLayerVisibility}
        onExportLayer={exportLayer}
      />

      <FeatureInfoPanel
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />
    </div>
  );
};

