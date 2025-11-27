/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Layer, NavigationControl, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import api, { getAccessToken, refreshAccessToken } from "@/lib/axios";
import { useLocalityShapefileQuery } from "@/queries/useLocalityQuery";
import { fcToBounds } from "../utils/geo";

const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v11";
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiY3Jlc2NlbnRzYW1iaWxhIiwiYSI6ImNtZWx5ZXR4OTA5Y3gyanNkOHM0cjFtN2sifQ.RC22kROvjoVE5LdsCSPSsA";

interface Props {
  planId: number;
  versionId: number;
  localityId?: number;
}

export default function PlanVersionMap({ planId, versionId, localityId }: Props) {
  const mapGLRef = useRef<any>(null);
  const [baseMapBounds, setBaseMapBounds] = useState<
    [[number, number], [number, number]] | null
  >(null);

  const API_BASE = useMemo(
    () => (api.defaults.baseURL || "").replace(/\/$/, ""),
    []
  );

  // Fetch locality boundary (basemap)
  const { data: baseMapData } = useLocalityShapefileQuery(
    localityId ? String(localityId) : undefined
  );

  useEffect(() => {
    if (baseMapData) {
      setBaseMapBounds(fcToBounds(baseMapData));
    }
  }, [baseMapData]);

  const tilesTemplate = useMemo(
    () => `${API_BASE}/zoning/plans/${planId}/versions/${versionId}/tiles/{z}/{x}/{y}.mvt`,
    [API_BASE, planId, versionId]
  );

  const transformRequest = useCallback(
    (url: string) => {
      const isApiCall =
        url.startsWith(API_BASE) ||
        url.startsWith(API_BASE.replace(/^https?:\/\//, ""));
      if (!isApiCall) return { url };
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return { url, headers } as any;
    },
    [API_BASE]
  );

  // Map load callback - fit to basemap bounds
  const onMapLoad = useCallback(() => {
    if (baseMapBounds) {
      const mapRef = mapGLRef.current;
      const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
      if (map?.fitBounds) {
        map.fitBounds(
          [
            [baseMapBounds[0][0], baseMapBounds[0][1]],
            [baseMapBounds[1][0], baseMapBounds[1][1]],
          ],
          { padding: 40, duration: 800 }
        );
      }
    }
  }, [baseMapBounds]);

  // Handle 401 errors on tile requests
  useEffect(() => {
    const mapRef = mapGLRef.current;
    if (!mapRef) return;
    const map = mapRef.getMap ? mapRef.getMap() : mapRef;
    const onError = async (e: any) => {
      const status = e?.error?.status || e?.error?.cause?.status;
      if (status !== 401) return;
      try {
        await refreshAccessToken();
        const src: any = map.getSource("plan-version-tiles");
        if (src?.setTiles) {
          const v = Date.now();
          const [base, qs = ""] = tilesTemplate.split("?");
          src.setTiles([`${base}?${qs}&v=${v}`]);
        } else {
          map.triggerRepaint();
        }
      } catch (err) {
        console.error(err);
      }
    };
    map.on("error", onError);
    return () => map.off("error", onError);
  }, [tilesTemplate]);

  return (
    <MapGL
      ref={mapGLRef}
      onLoad={onMapLoad}
      initialViewState={{ longitude: 39.2, latitude: -6.36, zoom: 12 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAPBOX_STYLE}
      mapboxAccessToken={MAPBOX_TOKEN}
      transformRequest={transformRequest}
      maxZoom={20}
    >
      <NavigationControl position="top-left" />

      {/* Basemap (locality boundary) */}
      {baseMapData && (
        <Source
          id="basemap-src"
          type="geojson"
          data={
            {
              ...baseMapData,
              features: baseMapData.features.map((f: any) => ({
                ...f,
                geometry: {
                  ...f.geometry,
                  coordinates: f.geometry.coordinates,
                  type: f.geometry.type,
                },
                properties: f.properties ?? {},
              })),
            } as any
          }
        >
          <Layer
            id="basemap-fill"
            type="fill"
            paint={{ "fill-color": "#3b82f6", "fill-opacity": 0.1 }}
          />
          <Layer
            id="basemap-line"
            type="line"
            paint={{
              "line-color": "#2563eb",
              "line-width": 2,
              "line-opacity": 0.8,
            }}
          />
        </Source>
      )}

      {/* Plan zones from MVT */}
      <Source
        id="plan-version-tiles"
        type="vector"
        tiles={[tilesTemplate]}
        minzoom={1}
        maxzoom={22}
        promoteId="id"
      >
        {/* Polygon fill layer */}
        <Layer
          id="plan-version-fill"
          type="fill"
          source-layer="zones"
          filter={["in", ["geometry-type"], ["literal", ["Polygon", "MultiPolygon"]]]}
          paint={{
            "fill-color": ["coalesce", ["get", "color"], "#6b7280"],
            "fill-opacity": 0.5,
          }}
        />
        {/* Polygon outline layer */}
        <Layer
          id="plan-version-line"
          type="line"
          source-layer="zones"
          filter={["in", ["geometry-type"], ["literal", ["Polygon", "MultiPolygon"]]]}
          paint={{ "line-color": "#1f2937", "line-width": 0.75 }}
        />
        {/* LineString layer */}
        <Layer
          id="plan-version-linestring"
          type="line"
          source-layer="zones"
          filter={["in", ["geometry-type"], ["literal", ["LineString", "MultiLineString"]]]}
          paint={{
            "line-color": ["coalesce", ["get", "color"], "#6b7280"],
            "line-width": [
              "coalesce",
              ["get", "road_width_m"],
              3,
            ],
            "line-opacity": 0.8,
          }}
        />
        {/* Point layer */}
        <Layer
          id="plan-version-point"
          type="circle"
          source-layer="zones"
          filter={["in", ["geometry-type"], ["literal", ["Point", "MultiPoint"]]]}
          paint={{
            "circle-color": ["coalesce", ["get", "color"], "#6b7280"],
            "circle-radius": 4,
            "circle-opacity": 0.8,
            "circle-stroke-color": "#1f2937",
            "circle-stroke-width": 1,
          }}
        />
      </Source>
    </MapGL>
  );
}
