import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import api, { getAccessToken, refreshAccessToken } from "@/lib/axios";
import { useLocalityShapefileQuery } from '@/queries/useLocalityQuery';
import useSubdivisionStore from '../store/useSubdivisionStore';
import { fcToBounds } from "../../zoning/utils/geo";

const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v11";
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface Props {
  localityId?: string | number | null;
  parentParcel?: any;
  disabled?: boolean;
}

export default function SubdivisionMapEngine({ localityId }: Props) {
  const mapGLRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [baseMapBounds, setBaseMapBounds] = useState<[[number, number], [number, number]] | null>(null);

  // Store hooks and data
  const togglePlan = useSubdivisionStore((s) => s.togglePlan);
  const API_BASE = useMemo(() => (api.defaults.baseURL || "").replace(/\/$/, ""), []);

  // Plans tiles template
  const plansTilesTemplate = useMemo(() => {
    if (!localityId) return "";
    return `${API_BASE}/zoning/plans/latest/${localityId}/tiles/{z}/{x}/{y}.mvt`;
  }, [API_BASE, localityId]);

  // Transform request to add auth headers
  const transformRequest = useCallback(
    (url: string) => {
      const isApiCall = url.startsWith(API_BASE) || url.startsWith(API_BASE.replace(/^https?:\/\//, ''));
      if (!isApiCall) return { url };
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return { url, headers };
    },
    [API_BASE]
  );

  // Basemap GeoJSON + bounds
  const { data: baseMapData } = useLocalityShapefileQuery(localityId ? String(localityId) : undefined);
  useEffect(() => {
    if (baseMapData) setBaseMapBounds(fcToBounds(baseMapData));
  }, [baseMapData]);

  // Error handling for tile requests
  useEffect(() => {
    const mapRef = mapGLRef.current;
    if (!mapRef) return;
    const map = mapRef.getMap ? mapRef.getMap() : mapRef;
    const onError = async (e: any) => {
      const status = e?.error?.status || e?.error?.cause?.status;
      // If unauthorized, try refreshing the token and cache-busting the template
      if (status === 401) {
        try {
          await refreshAccessToken();
          const src: any = map.getSource("plans-tiles");
          if (src?.setTiles) {
            const v = Date.now();
            src.setTiles([`${plansTilesTemplate}?v=${v}`]);
          } else {
            map.triggerRepaint();
          }
        } catch (e: unknown) {
          console.error(e);
        }
        return;
      }

        // For 404/410 we don't attempt parent-zoom fallback here (zoning only refreshes on 401)
    };
    map.on("error", onError);
    return () => map.off("error", onError);
  }, [plansTilesTemplate]);

  // Map load handler
  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    const mapRef = mapGLRef.current;

    // Fit to basemap bounds if available
    if (baseMapBounds) {
      (mapRef.fitBounds || mapRef.getMap()?.fitBounds)?.(baseMapBounds, {
        padding: 24,
        duration: 800,
      });
    }
  }, [baseMapBounds]);

  // Plan click handler
  const onPlanClick = useCallback((e: any) => {
    const features = e.features;
    if (!features?.length) return;
    
    const feature = features[0];
    const planId = feature.properties?.id;
    if (planId) {
      togglePlan(planId);
    }
  }, [togglePlan]);

  // Add click handler for plans layer
  useEffect(() => {
    const mapRef = mapGLRef.current;
    if (!mapRef || !isMapLoaded) return;
    
    const map = mapRef.getMap ? mapRef.getMap() : mapRef;
    map.on('click', 'plans-fill', onPlanClick);
    
    return () => {
      map.off('click', 'plans-fill', onPlanClick);
    };
  }, [isMapLoaded, onPlanClick]);

  if (!localityId) return null;

  return (
    <div className="w-full h-full relative">
      <MapGL
        ref={mapGLRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 35,
          latitude: -6,
          zoom: 10,
        }}
        mapStyle={MAPBOX_STYLE}
        style={{ width: "100%", height: "100%" }}
        transformRequest={transformRequest}
        onLoad={onMapLoad}
        interactiveLayerIds={["plans-fill"]}
      >
        {isMapLoaded && plansTilesTemplate && (
          <>
            <Source
              id="plans-tiles"
              type="vector"
              tiles={[plansTilesTemplate]}
              minzoom={0}
              maxzoom={22}
            >
              <Layer
                id="plans-fill"
                type="fill"
                source="plans-tiles"
                source-layer="zones"
                paint={{
                  "fill-color": ["get", "color"],
                  "fill-opacity": 0.5,
                }}
              />
              <Layer
                id="plans-line"
                type="line"
                source="plans-tiles"
                source-layer="zones"
                paint={{
                  "line-color": "#000000",
                  "line-width": 1,
                }}
              />
            </Source>
          </>
        )}
        <div className="absolute top-2 right-2">
          <NavigationControl />
        </div>
      </MapGL>
    </div>
  );
}
