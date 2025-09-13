// ZoningMapCore.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  Settings,
  Square,
  Edit3,
  Maximize,
  Minimize,
  Palette,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Pencil,
  Save as SaveIcon,
  Trash2,
} from "lucide-react";

import { ZoneDetailsPanel } from "./components/ZoneDetailsPanel";
import { ConflictsPanel } from "./components/ConflictsPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { ZoneLegend } from "./components/ZoneLegend";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { useLocalityShapefileQuery } from "@/queries/useLocalityQuery";
import { useZoneDetailQuery, useUpdateZoneStatus } from "@/queries/useZoningQuery";

import api, { getAccessToken, refreshAccessToken } from "@/lib/axios";

import MapGL, { Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

/* --------------------------------- Map style -------------------------------- */
const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v11";
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiY3Jlc2NlbnRzYW1iaWxhIiwiYSI6ImNtZWx5ZXR4OTA5Y3gyanNkOHM0cjFtN2sifQ.RC22kROvjoVE5LdsCSPSsA";

/* ----------------------------- Helpers / bounds ----------------------------- */
const fcToBounds = (fc: any): [[number, number], [number, number]] | null => {
  if (!fc?.features?.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of fc.features) {
    const each = (coords: any) => {
      if (typeof coords?.[0] === "number") {
        const [x, y] = coords;
        if (Number.isFinite(x) && Number.isFinite(y)) {
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        }
      } else if (Array.isArray(coords)) coords.forEach(each);
    };
    const g = f.geometry;
    if (!g) continue;
    if (g.type === "Polygon" || g.type === "MultiPolygon") each(g.coordinates);
  }
  if (minX === Infinity) return null;
  return [[minX, minY], [maxX, maxY]];
};

const getOuterRing = (geom: any): number[][] => {
  if (!geom) return [];
  if (geom.type === "Polygon") return geom.coordinates?.[0] ?? [];
  if (geom.type === "MultiPolygon") {
    let best: number[][] = []; let bestLen = 0;
    (geom.coordinates || []).forEach((poly: number[][][]) => {
      const ring = poly?.[0] || [];
      if (ring.length > bestLen) { best = ring; bestLen = ring.length; }
    });
    return best;
  }
  return [];
};

/* ------------------------------ Types & helpers ----------------------------- */
type DrawState = "added" | "edited" | "deleted";
type DrawFeatureState = {
  feature: any;
  state: DrawState;
  original?: any | null;
};
const toFeatureCollection = (features: any[]) => ({ type: "FeatureCollection", features });

const DRAW_LAYER_IDS = [
  "gl-draw-polygon-fill-inactive",
  "gl-draw-polygon-fill-active",
  "gl-draw-polygon-stroke-inactive",
  "gl-draw-polygon-stroke-active",
  "gl-draw-line-inactive",
  "gl-draw-line-active",
  "gl-draw-point-inactive",
  "gl-draw-point-active",
  "gl-draw-polygon-and-line-vertex-halo-inactive",
  "gl-draw-polygon-and-line-vertex-halo-active",
  "gl-draw-polygon-and-line-vertex-stroke-inactive",
  "gl-draw-polygon-and-line-vertex-stroke-active",
  "gl-draw-polygon-and-line-vertex-inactive",
  "gl-draw-polygon-and-line-vertex-active",
  "gl-draw-midpoint-halo",
  "gl-draw-midpoint",
];

/* ------------------------------ Component props ----------------------------- */
interface ZoningMapCoreProps {
  project: any;
  isMaximized?: boolean;
  onMaximizeToggle?: () => void;
  colorMode: "type" | "status";
  onColorModeChange: (m: "type" | "status") => void;

  /** Locality (basemap) used for fit/boundary fetch; usually a string */
  baseMapId?: string;

  /** The REAL DB id for Locality. We will ALWAYS use this for new polygons. */
  localityDbId?: number;

  /** Required for creating new zones (if your model requires plan). */
  planId?: number;

  /** Default land use to apply to newly drawn polygons. */
  defaultLandUseId?: number;
}

/* --------------------------------- Component -------------------------------- */
export function ZoningMapCore({
  baseMapId,
  localityDbId,
  isMaximized = false,
  onMaximizeToggle,
  colorMode,
  onColorModeChange,
  planId,
  defaultLandUseId,
}: ZoningMapCoreProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<"select" | "draw" | "edit">("select");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [layersOpen, setLayersOpen] = useState(true);
  const [layerVisibility, setLayerVisibility] = useState({ basemap: true });
  const [layerOpacity, setLayerOpacity] = useState({ basemap: 30 });
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState("details");

  // NEW: choose land use for new polygons (replace with your real select UI)
  const [newZoneLandUseId, setNewZoneLandUseId] = useState<number | undefined>(
    defaultLandUseId
  );

  // Map refs/state
  const mapGLRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [baseMapBounds, setBaseMapBounds] =
    useState<[[number, number], [number, number]] | null>(null);

  // Draw refs/state
  const drawRef = useRef<any>(null);
  const [drawStates, setDrawStates] =
    useState<Map<string, DrawFeatureState>>(new globalThis.Map());

  const API_BASE = useMemo(
    () => (api.defaults.baseURL || "").replace(/\/$/, ""),
    []
  );

  const zonesTilesTemplate = useMemo(() => {
    const q = new URLSearchParams();
    if (baseMapId) q.set("locality", baseMapId);
    return `${API_BASE}/zoning/zones/tiles/{z}/{x}/{y}.mvt?${q.toString()}`;
  }, [API_BASE, baseMapId]);

  /* ------------------------- Protected tiles: auth header ------------------------- */
  const transformRequest = useCallback((url: string) => {
    if (!API_BASE) return { url };
    const isApiCall =
      url.startsWith(API_BASE) || url.startsWith(API_BASE.replace(/^https?/, ""));
    if (!isApiCall) return { url };
    const token =
      typeof getAccessToken === "function"
        ? getAccessToken()
        : localStorage.getItem("accessToken") || "";
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return { url, headers } as any;
  }, [API_BASE]);

  // Auto refresh on tile 401s
  useEffect(() => {
    const mapRef = mapGLRef.current;
    if (!mapRef) return;
    const map = mapRef.getMap ? mapRef.getMap() : mapRef;

    const onError = async (e: any) => {
      const status = e?.error?.status || e?.error?.cause?.status;
      if (status !== 401) return;
      try {
        if (typeof refreshAccessToken === "function") {
          await refreshAccessToken();
        } else {
          const refresh = localStorage.getItem("refreshToken");
          if (refresh) {
            const res = await api.post("/auth/token/refresh/", { refresh });
            const newAccess = (res as any)?.data?.access;
            if (newAccess) localStorage.setItem("accessToken", newAccess);
          }
        }
        const src: any = map.getSource("zones-tiles");
        if (src?.setTiles) {
          const v = Date.now();
          const [base, qs = ""] = zonesTilesTemplate.split("?");
          src.setTiles([`${base}?${qs}&v=${v}`]);
        } else {
          map.triggerRepaint();
        }
      } catch { /* ignore */ }
    };

    map.on("error", onError);
    return () => map.off("error", onError);
  }, [zonesTilesTemplate]);

  /* --------------------------- Basemap boundary (fit) --------------------------- */
  const {
    data: baseMapData,
    isLoading: baseMapLoading,
    error: baseMapError,
  } = useLocalityShapefileQuery(baseMapId);

  useEffect(() => {
    const t = setTimeout(() => {
      mapGLRef.current?.resize?.();
    }, 50);
    return () => clearTimeout(t);
  }, [isMaximized]);

  useEffect(() => {
    setIsLoading(true);
    setLoadingProgress(10);
    const t1 = setTimeout(() => setLoadingProgress(40), 300);
    const t2 = setTimeout(() => setLoadingProgress(70), 700);
    const t3 = setTimeout(() => setLoadingProgress(100), 1000);
    const t4 = setTimeout(() => setIsLoading(false), 1200);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [baseMapId]);

  useEffect(() => {
    if (!baseMapData) return;
    setBaseMapBounds(fcToBounds(baseMapData));
  }, [baseMapData]);

  useEffect(() => {
    const mapRef = mapGLRef.current;
    if (!isMapLoaded || !mapRef || !baseMapBounds) return;
    (mapRef.fitBounds || mapRef.getMap()?.fitBounds)?.(
      [
        [baseMapBounds[0][0], baseMapBounds[0][1]],
        [baseMapBounds[1][0], baseMapBounds[1][1]],
      ],
      { padding: 24, duration: 800 }
    );
  }, [isMapLoaded, baseMapBounds]);

  /* --------------------------------- Draw helpers -------------------------------- */
  const bringDrawLayersToFront = useCallback(() => {
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    if (!map) return;
    DRAW_LAYER_IDS.forEach((id) => {
      if (map.getLayer(id)) {
        try { map.moveLayer(id); } catch {}
      }
    });
  }, []);

  const initDraw = useCallback(() => {
    const mapRef = mapGLRef.current;
    if (!mapRef || drawRef.current) return;
    const map = mapRef.getMap ? mapRef.getMap() : mapRef;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: "simple_select",
    });

    map.addControl(draw as any, "top-left");
    drawRef.current = draw;
    bringDrawLayersToFront();

    map.on("draw.create", (e: any) => {
      const feats = e.features || [];
      setDrawStates((prev) => {
        const next = new globalThis.Map(prev);
        feats.forEach((f: any) => {
          const id = String(f.id || f.properties?.id || Date.now());
          next.set(id, { feature: f, state: "added", original: null });
        });
        return next;
      });
      if (feats.length) toast.success("Polygon created. Double-click finishes.");
      bringDrawLayersToFront();
    });

    map.on("draw.update", (e: any) => {
      const feats = e.features || [];
      setDrawStates((prev) => {
        const next = new globalThis.Map(prev);
        feats.forEach((f: any) => {
          const id = String(f.id || f.properties?.id || Date.now());
          const existing = next.get(id) || prev.get(id);
          if (existing?.state === "added") {
            next.set(id, { feature: f, state: "added", original: existing.original });
          } else {
            next.set(id, { feature: f, state: "edited", original: existing?.original || f });
          }
        });
        return next;
      });
      bringDrawLayersToFront();
    });

    map.on("draw.delete", (e: any) => {
      const feats = e.features || [];
      setDrawStates((prev) => {
        const next = new globalThis.Map(prev);
        feats.forEach((f: any) => {
          const id = String(f.id || f.properties?.id || Date.now());
          const existing = next.get(id);
          if (existing?.state === "added") {
            next.delete(id);
          } else {
            next.set(id, { feature: f, state: "deleted", original: existing?.original || f });
          }
        });
        return next;
      });
      bringDrawLayersToFront();
    });
  }, [bringDrawLayersToFront]);

  const setDrawMode = useCallback((
    mode: "simple_select" | "draw_polygon" | "direct_select" | "trash"
  ) => {
    const draw = drawRef.current;
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    if (!draw || !map) return;

    const canvas: HTMLCanvasElement | undefined = map.getCanvas?.();
    if (mode === "draw_polygon") {
      canvas && (canvas.style.cursor = "crosshair");
    } else {
      canvas && (canvas.style.cursor = "");
    }

    if (mode === "trash") draw.trash();
    else (draw as any).changeMode(mode);

    setTimeout(bringDrawLayersToFront, 0);
  }, [bringDrawLayersToFront]);

  /* --------------------------------- Details / edit -------------------------------- */
  const { data: zoneDetail } = useZoneDetailQuery(activeZone || undefined);

  const editActiveZoneInDraw = useCallback(async () => {
    if (!activeZone) return;
    const draw = drawRef.current;
    const mapRef = mapGLRef.current;
    if (!draw || !mapRef) return;
    if (!zoneDetail) {
      toast.error("Zone detail not loaded yet");
      return;
    }
    const numericId = Number(activeZone);
    const feature = {
      type: "Feature",
      id: Number.isFinite(numericId) ? numericId : activeZone, // keep DB id numeric if possible
      properties: {
        id: Number.isFinite(numericId) ? numericId : activeZone,
        land_use: zoneDetail.land_use,
        plan: zoneDetail.plan,
        locality: zoneDetail.locality, // DB id from backend
        status: zoneDetail.status,
      },
      geometry: zoneDetail.geom,
    };
    try {
      draw.add(feature as any);
      (draw as any).changeMode("direct_select", { featureId: feature.id });
      setDrawStates((prev) => {
        const next = new globalThis.Map(prev);
        next.set(String(feature.id), { feature, state: "edited", original: feature });
        return next;
      });
      setSelectedTool("edit");
      bringDrawLayersToFront();
    } catch {
      toast.error("Failed to add feature to editor");
    }
  }, [activeZone, zoneDetail, bringDrawLayersToFront]);

  /* ------------------------------ Save changes (bulk) ------------------------------ */
  const onSaveDrawChanges = useCallback(async () => {
    const arr = Array.from(drawStates.entries());
    if (!arr.length) {
      toast.info("No changes to save");
      return;
    }

    const locId = Number(localityDbId ?? baseMapId);
    const hasValidLocality = Number.isFinite(locId);

    const features = arr.map(([clientId, s]) => {
      const rawId = s.feature?.id ?? clientId;
      const rawProps = s.feature?.properties ?? {};
      const numericId = Number(rawId);
      const isExisting = s.state !== "added" && Number.isFinite(numericId);

      // land_use for NEW polygons: from feature if present, else from UI/default
      const landUseForNew =
        rawProps.land_use ?? newZoneLandUseId;

      const props: any = {
        // include id ONLY for edited/deleted AND numeric
        ...(isExisting ? { id: numericId } : {}),
        // include plan only if provided (your model may require it)
        ...(Number.isFinite(planId) ? { plan: planId } : {}),
        // land_use: prefer existing property; otherwise use chosen default
        ...(s.state === "added"
          ? { land_use: landUseForNew }
          : { land_use: rawProps.land_use }),
        // locality: always the DB id you pass in props (for NEW)
        ...(s.state === "added" && hasValidLocality ? { locality: locId } : {}),
        // carry status if present, else default to Draft on create
        status: rawProps.status ?? (s.state === "added" ? "Draft" : undefined),
      };

      return {
        type: "Feature",
        // do NOT set top-level id for NEW features (Mapbox string ids break DRF integer field)
        ...(isExisting ? { id: numericId } : {}),
        properties: props,
        geometry: s.feature.geometry,
      };
    });

    // Validate NEW features have minimum metadata
    const missingMeta = features.some((f) => {
      const isNew = typeof (f as any).id === "undefined";
      if (!isNew) return false;
      const p = (f as any).properties || {};
      return !p.land_use || !p.locality || (!Number.isFinite(planId) && p.plan == null);
    });

    if (missingMeta) {
      toast.error(
        "New polygons need at least land_use and locality (and plan if your model requires it)."
      );
      return;
    }

    const body = toFeatureCollection(features);

    try {
      await api.post("/zoning/zones/bulk/", body);
      toast.success("Changes saved");

      // clear draw + local state
      setDrawStates(new globalThis.Map());
      try { drawRef.current?.deleteAll(); } catch {}

      // refresh tiles
      const mapRef = mapGLRef.current;
      const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
      const src: any = map?.getSource("zones-tiles");
      if (src?.setTiles) {
        const v = Date.now();
        const [base, qs = ""] = zonesTilesTemplate.split("?");
        src.setTiles([`${base}?${qs}&v=${v}`]);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Save failed");
    }
  }, [drawStates, planId, newZoneLandUseId, localityDbId, baseMapId, zonesTilesTemplate]);

  /* ------------------------------ Status actions ------------------------------ */
  const updateStatus = useUpdateZoneStatus({
    onDone: () => {
      const mapRef = mapGLRef.current;
      const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
      const src: any = map?.getSource("zones-tiles");
      if (src?.setTiles) {
        const v = Date.now();
        const [base, qs = ""] = zonesTilesTemplate.split("?");
        src.setTiles([`${base}?${qs}&v=${v}`]);
      }
    },
  });

  const approve = useCallback(() => {
    if (!activeZone) return;
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    map?.setFeatureState(
      { source: "zones-tiles", sourceLayer: "zones", id: Number(activeZone) || activeZone },
      { status: "Approved" }
    );
    updateStatus.mutate({ id: activeZone, status: "Approved" });
  }, [activeZone, updateStatus]);

  const reject = useCallback(() => {
    if (!activeZone) return;
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    map?.setFeatureState(
      { source: "zones-tiles", sourceLayer: "zones", id: Number(activeZone) || activeZone },
      { status: "Rejected" }
    );
    updateStatus.mutate({ id: activeZone, status: "Rejected" });
  }, [activeZone, updateStatus]);

  /* --------------------------------- Map events -------------------------------- */
  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    initDraw();
    setTimeout(bringDrawLayersToFront, 0);
  }, [initDraw, bringDrawLayersToFront]);

  useEffect(() => {
    if (!isMapLoaded) return;
    const t = setTimeout(bringDrawLayersToFront, 0);
    return () => clearTimeout(t);
  }, [isMapLoaded, bringDrawLayersToFront, layerVisibility]);

  const onMapClick = useCallback(
    (e: any) => {
      if (selectedTool === "draw" || selectedTool === "edit") return;
      const mapRef = mapGLRef.current;
      const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
      const f = map?.queryRenderedFeatures(e.point, { layers: ["zones-fill"] })?.[0];
      if (!f) return;
      const id = f.id ?? f.properties?.id;
      if (id !== undefined && id !== null) setActiveZone(String(id));
    },
    [selectedTool]
  );

  /* ------------------------------------ UI ------------------------------------ */
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* Loading bar */}
      {isLoading && (
        <div className="h-1 bg-muted relative overflow-hidden shrink-0">
          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${loadingProgress}%` }} />
        </div>
      )}

      {/* Ribbon */}
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">Selection:</span>
          <Button
            type="button"
            variant={selectedTool === "select" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setSelectedTool("select"); setDrawMode("simple_select"); }}
            className="h-8 px-2"
          >
            <Settings className="w-4 h-4 mr-1" /> Select
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">Draw:</span>
          <Button
            type="button"
            variant={selectedTool === "draw" ? "default" : "ghost"}
            size="sm"
            disabled={!isMapLoaded || !drawRef.current}
            onClick={() => { setSelectedTool("draw"); setDrawMode("draw_polygon"); }}
            className="h-8 px-2"
          >
            <Square className="w-4 h-4 mr-1" /> Polygon
          </Button>
          <Button
            type="button"
            variant={selectedTool === "edit" ? "default" : "ghost"}
            size="sm"
            disabled={!isMapLoaded || !drawRef.current}
            onClick={() => { setSelectedTool("edit"); setDrawMode("direct_select"); }}
            className="h-8 px-2"
          >
            <Edit3 className="w-4 h-4 mr-1" /> Vertices
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!isMapLoaded || !drawRef.current}
            onClick={() => setDrawMode("trash")}
            className="h-8 px-2"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* NEW: quick inputs for meta on new zones */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Land Use (new):</span>
            <input
              type="number"
              className="h-8 w-24 rounded border px-2 text-sm"
              value={newZoneLandUseId ?? ""}
              onChange={(e) => setNewZoneLandUseId(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="ID"
              title="Default land_use id for newly drawn polygons"
            />
          </div>
          {/* If you want: add similar input for plan id, or keep it as prop */}
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Edit existing zone from tiles + Save */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!activeZone}
            onClick={editActiveZoneInDraw}
            className="h-8 px-2"
            title={activeZone ? "Load selected zone into editor" : "Select a zone on the map first"}
          >
            <Pencil className="w-4 h-4 mr-1" /> Edit Selected
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onSaveDrawChanges}
            className="h-8 px-2"
            disabled={Array.from(drawStates.values()).length === 0}
            title="Save added/edited/deleted polygons"
          >
            <SaveIcon className="w-4 h-4 mr-1" /> Save ({Array.from(drawStates.values()).length})
          </Button>
        </div>

        <div className="flex-1" />

        {/* Color Mode */}
        <div className="flex items-center gap-3">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Type</span>
          <Switch checked={colorMode === "status"} onCheckedChange={(c) => onColorModeChange(c ? "status" : "type")} />
          <span className="text-sm text-muted-foreground">Status</span>

          {onMaximizeToggle && (
            <Button type="button" variant="outline" size="sm" onClick={onMaximizeToggle} className="h-8 px-2 ml-2">
              {isMaximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* 3-pane layout */}
      <div className="flex-1 min-h-0 flex">
        {/* Left Panel */}
        <div className={`transition-all duration-300 border-r bg-card ${leftPanelOpen ? "w-80" : "w-0"} overflow-hidden shrink-0 flex flex-col min-h-0`}>
          <div className="p-4 h-full flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3>Zone Tools</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setLeftPanelOpen(false)}>
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>

            <ZoneLegend colorMode={colorMode} />

            <Separator className="my-4" />

            <div className="space-y-4">
              <h4>Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Import coming soon")}>
                  <UploadIcon className="w-4 h-4 mr-2" /> Import
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Export coming soon")}>
                  <DownloadIcon className="w-4 h-4 mr-2" /> Export
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Added: {Array.from(drawStates.values()).filter(s => s.state === "added").length}</div>
                <div>Edited: {Array.from(drawStates.values()).filter(s => s.state === "edited").length}</div>
                <div>Deleted: {Array.from(drawStates.values()).filter(s => s.state === "deleted").length}</div>
                <div>Total: {Array.from(drawStates.values()).length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative min-h-0 overflow-hidden">
          {!leftPanelOpen && (
            <Button type="button" variant="outline" size="sm" className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm shadow-lg" onClick={() => setLeftPanelOpen(true)}>
              <Settings className="w-4 h-4 mr-2" /> Tools
            </Button>
          )}

          {/* Layers Panel */}
          <div className="absolute top-4 right-4 z-20">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg w-64">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Layers
                  </CardTitle>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setLayersOpen(!layersOpen)} className="p-0">
                    {layersOpen ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              </CardHeader>
              {layersOpen && (
                <CardContent className="pt-0 space-y-3 max-h-80 overflow-y-auto">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Basemap</span>
                      <Switch checked={layerVisibility.basemap} onCheckedChange={() => setLayerVisibility((p) => ({ ...p, basemap: !p.basemap }))} />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* The actual map */}
          <div className="absolute inset-0">
            <MapGL
              ref={mapGLRef}
              onLoad={onMapLoad}
              onClick={onMapClick}
              initialViewState={{ longitude: 39.2, latitude: -6.36, zoom: 12 }}
              style={{ width: "100%", height: "100%" }}
              mapStyle={MAPBOX_STYLE}
              mapboxAccessToken={MAPBOX_TOKEN}
              transformRequest={transformRequest}
              maxZoom={20}
            >
              <NavigationControl position="top-left" />

              {/* Basemap boundary (optional) */}
              {baseMapData && (
                <Source id="basemap-src" type="geojson" data={baseMapData}>
                  <Layer
                    id="basemap-fill"
                    type="fill"
                    layout={{ visibility: layerVisibility.basemap ? "visible" : "none" }}
                    paint={{ "fill-color": "#3b82f6", "fill-opacity": (layerOpacity.basemap ?? 30) / 100 }}
                  />
                  <Layer
                    id="basemap-line"
                    type="line"
                    layout={{ visibility: layerVisibility.basemap ? "visible" : "none" }}
                    paint={{ "line-color": "#2563eb", "line-width": 1.2, "line-opacity": 0.9 }}
                  />
                </Source>
              )}

              {/* ZONES VIA MVT (protected) */}
              <Source id="zones-tiles" type="vector" tiles={[zonesTilesTemplate]} minzoom={10} maxzoom={22} promoteId="id">
                <Layer
                  id="zones-fill"
                  type="fill"
                  source-layer="zones"
                  paint={{
                    "fill-color": [
                      "case",
                      ["==", ["feature-state", "status"], "Approved"], "#22c55e",
                      ["==", ["feature-state", "status"], "Rejected"], "#dc2626",
                      ["==", ["get", "status"], "Approved"], "#22c55e",
                      ["==", ["get", "status"], "Rejected"], "#dc2626",
                      ["==", ["get", "status"], "In Review"], "#f59e0b",
                      ["coalesce", ["get", "color"], "#6b7280"],
                    ],
                    "fill-opacity": 0.5,
                  }}
                />
                <Layer id="zones-line" type="line" source-layer="zones" paint={{ "line-color": "#1f2937", "line-width": 0.75 }} />
              </Source>
            </MapGL>

            {/* Map info panel */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Tool:</span>
                  <span className="capitalize">{selectedTool}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Basemap: {baseMapLoading ? "Loading…" : baseMapError ? "Error" : "Loaded"}
                </div>
              </div>
            </div>

            {/* Draw hint pill */}
            {selectedTool === "draw" && (
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded px-3 py-2 text-xs shadow">
                Click to add vertices, <b>double-click</b> to finish. Press <b>Esc</b> to cancel.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-72 border-l bg-card shrink-0 flex flex-col min-h-0">
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 shrink-0">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0">
              <TabsContent value="details" className="h-full p-0">
                <div className="h-full overflow-y-auto">
                  <ZoneDetailsPanel
                    activeZone={activeZone}
                    zones={
                      zoneDetail
                        ? [{
                            id: zoneDetail.id,
                            type: String(zoneDetail.land_use ?? ""),
                            status: zoneDetail.status,
                            color: zoneDetail.color,
                            coordinates: getOuterRing(zoneDetail.geom),
                            notes: zoneDetail.notes,
                          }]
                        : []
                    }
                    onUpdateZone={() => {}}
                    conflicts={[]}
                    onApprove={approve}
                    onReject={reject}
                  />
                </div>
              </TabsContent>
              <TabsContent value="conflicts" className="h-full p-0">
                <div className="h-full overflow-y-auto">
                  <ConflictsPanel conflicts={[]} zones={[]} />
                </div>
              </TabsContent>
              <TabsContent value="history" className="h-full p-0">
                <div className="h-full overflow-y-auto">
                  <HistoryPanel zones={[]} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
