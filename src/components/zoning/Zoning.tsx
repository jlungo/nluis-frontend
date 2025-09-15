import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Layers,
  Eye,
  EyeOff,
  Settings,
  Square,
  Edit3,
  Trash2,
  Maximize,
  Minimize,
  Palette,
  Pencil,
  Save as SaveIcon,
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
import {
  useZoneDetailQuery,
  useUpdateZoneStatus,
  useDeleteZone,
} from "@/queries/useZoningQuery";
import { useLandUsesQuery, LandUseDto } from "@/queries/useSetupQuery";

import api, { getAccessToken, refreshAccessToken } from "@/lib/axios";
import MapGL, { Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
// @ts-ignore
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

/* --------------------------------- Map style -------------------------------- */
const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v11";
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiY3Jlc2NlbnRzYW1iaWxhIiwiYSI6ImNtZWx5ZXR4OTA5Y3gyanNkOHM0cjFtN2sifQ.RC22kROvjoVE5LdsCSPSsA";

/* ----------------------------- Helpers / bounds ----------------------------- */
const fcToBounds = (fc: any): [[number, number], [number, number]] | null => {
  if (!fc?.features?.length) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const f of fc.features) {
    const each = (coords: any) => {
      if (typeof coords?.[0] === "number") {
        const [x, y] = coords;
        if (Number.isFinite(x) && Number.isFinite(y)) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      } else if (Array.isArray(coords)) coords.forEach(each);
    };
    const g = f.geometry;
    if (!g) continue;
    if (g.type === "Polygon" || g.type === "MultiPolygon") each(g.coordinates);
  }
  if (minX === Infinity) return null;
  return [
    [minX, minY],
    [maxX, maxY],
  ];
};

const getOuterRing = (geom: any): number[][] => {
  if (!geom) return [];
  if (geom.type === "Polygon") return geom.coordinates?.[0] ?? [];
  if (geom.type === "MultiPolygon") {
    let best: number[][] = [];
    let bestLen = 0;
    (geom.coordinates || []).forEach((poly: number[][][]) => {
      const ring = poly?.[0] || [];
      if (ring.length > bestLen) {
        best = ring;
        bestLen = ring.length;
      }
    });
    return best;
  }
  return [];
};

/* ------------------------------ Draw state types ---------------------------- */
type DrawState = "added" | "edited" | "deleted";
type DrawFeatureState = {
  feature: any;
  state: DrawState;
  original?: any | null;
};

/* ---------------------- GeoJSON normalization helpers ---------------------- */
const closeRing = (ring: number[][]) => {
  if (!ring?.length) return ring;
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  return fx === lx && fy === ly ? ring : [...ring, ring[0]];
};

const ensureMultiPolygon = (geometry: any) => {
  if (!geometry) return geometry;
  if (geometry.type === "Polygon") {
    const coords = (geometry.coordinates || []).map(closeRing);
    return { type: "MultiPolygon", coordinates: [coords] };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: (geometry.coordinates || []).map((poly: number[][][]) =>
        poly.map(closeRing)
      ),
    };
  }
  throw new Error("Only Polygon/MultiPolygon supported");
};

/* ----------------------------- Id helpers ---------------------------------- */
const isServerId = (id: string | null): boolean =>
  !!id && Number.isFinite(Number(id));

/* ------------------------------ Style helpers ------------------------------ */
type HatchParams = {
  fg: string;
  bg?: string | null;
  angle?: number;
  width?: number;
  spacing?: number;
};
type DotsParams = {
  fg: string;
  bg?: string | null;
  size?: number;
  spacing?: number;
};

function makeCanvas(w = 32, h = 32) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function drawHatchPattern(canvas: HTMLCanvasElement, p: HatchParams) {
  const ctx = canvas.getContext("2d")!;
  const step = Math.max(4, p.spacing ?? 8);
  const W = step * 2;
  canvas.width = W;
  canvas.height = W;
  if (p.bg) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, W);
  }
  ctx.strokeStyle = p.fg;
  ctx.lineWidth = Math.max(1, p.width ?? 1);
  const ang = ((p.angle ?? 45) * Math.PI) / 180;
  const diag = W * 1.5;
  ctx.translate(W / 2, W / 2);
  ctx.rotate(ang);
  for (let x = -W; x <= W; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, -diag);
    ctx.lineTo(x, diag);
    ctx.stroke();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawDotsPattern(canvas: HTMLCanvasElement, p: DotsParams) {
  const size = Math.max(2, p.size ?? 2);
  const spacing = Math.max(size * 2, p.spacing ?? 6);
  const W = spacing;
  canvas.width = W;
  canvas.height = W;
  const ctx = canvas.getContext("2d")!;
  if (p.bg) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, W);
  }
  ctx.fillStyle = p.fg;
  ctx.beginPath();
  ctx.arc(W / 2, W / 2, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawImagePattern(
  canvas: HTMLCanvasElement,
  url: string,
  bg?: string | null,
  onReady?: () => void
) {
  const ctx = canvas.getContext("2d")!;
  const W = 64;
  canvas.width = W;
  canvas.height = W;
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, W);
  }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  img.onload = () => {
    ctx.drawImage(img, 0, 0, W, W);
    onReady?.();
  };
}

function parseLandUseStyles(landUses: LandUseDto[]) {
  const solidColorByLU = new Map<number, string>();
  const patternByLU = new Map<
    number,
    { key: string; draw: (c: HTMLCanvasElement) => void }
  >();
  const badgeByLU = new Map<
    number,
    { text: string; textStyle?: any; box?: any }
  >();

  const asHex = (c?: string | null) =>
    typeof c === "string" && c.startsWith("#") ? c : undefined;

  for (const lu of landUses) {
    const s = lu.style;
    if (!s || !Array.isArray(s.layers)) {
      if (lu.color) solidColorByLU.set(lu.id, lu.color);
      continue;
    }
    const poly = s.layers.find((L: any) => L?.type === "polygon");
    const badge = s.layers.find((L: any) => L?.type === "badge");
    if (badge?.text) {
      badgeByLU.set(lu.id, {
        text: String(badge.text),
        textStyle: badge.textStyle || {},
        box: badge.box || {},
      });
    }
    if (!poly || !poly.fill) {
      if (lu.color) solidColorByLU.set(lu.id, lu.color);
      continue;
    }
    const fill = poly.fill;
    if (fill.type === "solid" && asHex(fill.color)) {
      solidColorByLU.set(lu.id, fill.color);
      continue;
    }
    if (fill.type === "pattern") {
      if (fill.pattern === "hatch") {
        const p: HatchParams = {
          fg: fill.fg || "#000",
          bg: fill.bg || null,
          angle: Number(fill.angle ?? 45),
          width: Number(fill.width ?? 1),
          spacing: Number(fill.spacing ?? 8),
        };
        const key = `hatch:${p.fg}:${p.bg || "none"}:${p.angle}:${p.width}:${p.spacing}`;
        patternByLU.set(lu.id, { key, draw: (canvas) => drawHatchPattern(canvas, p) });
      } else if (fill.pattern === "dots") {
        const p: DotsParams = {
          fg: fill.fg || "#000",
          bg: fill.bg || null,
          size: Number(fill.size ?? 2),
          spacing: Number(fill.spacing ?? 6),
        };
        const key = `dots:${p.fg}:${p.bg || "none"}:${p.size}:${p.spacing}`;
        patternByLU.set(lu.id, { key, draw: (canvas) => drawDotsPattern(canvas, p) });
      } else if (fill.pattern === "image" && typeof fill.url === "string") {
        const key = `img:${fill.url}`;
        patternByLU.set(lu.id, { key, draw: (canvas) => drawImagePattern(canvas, fill.url, fill.bg) });
      }
    }
  }
  return { solidColorByLU, patternByLU, badgeByLU };
}

/* --------------------------------- Props ----------------------------------- */
interface ZoningMapCoreProps {
  project?: any;
  isMaximized?: boolean;
  onMaximizeToggle?: () => void;
  colorMode: "type" | "status";
  onColorModeChange: (m: "type" | "status") => void;
  baseMapId?: string;
  defaultLandUseId?: number;
}

export function ZoningMapCore({
  baseMapId,
  isMaximized = false,
  onMaximizeToggle,
  colorMode,
  onColorModeChange,
  defaultLandUseId,
}: ZoningMapCoreProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<"select" | "draw" | "edit">(
    "select"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [layersOpen, setLayersOpen] = useState(true);
  const [layerVisibility, setLayerVisibility] = useState({ basemap: true });
  const [layerOpacity] = useState({ basemap: 30 });
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState("details");

  const mapGLRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [baseMapBounds, setBaseMapBounds] = useState<
    [[number, number], [number, number]] | null
  >(null);

  const drawRef = useRef<any>(null);
  const [drawStates, setDrawStates] = useState<Map<string, DrawFeatureState>>(
    new globalThis.Map()
  );

  const API_BASE = useMemo(
    () => (api.defaults.baseURL || "").replace(/\/$/, ""),
    []
  );
  const { data: landUses = [] } = useLandUsesQuery();

  const zonesTilesTemplate = useMemo(() => {
    const q = new URLSearchParams();
    if (baseMapId) q.set("locality", baseMapId);
    return `${API_BASE}/zoning/zones/tiles/{z}/{x}/{y}.mvt?${q.toString()}`;
  }, [API_BASE, baseMapId]);

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

  useEffect(() => {
    const mapRef = mapGLRef.current;
    if (!mapRef) return;
    const map = mapRef.getMap ? mapRef.getMap() : mapRef;
    const onError = async (e: any) => {
      const status = e?.error?.status || e?.error?.cause?.status;
      if (status !== 401) return;
      try {
        await refreshAccessToken();
        const src: any = map.getSource("zones-tiles");
        if (src?.setTiles) {
          const v = Date.now();
          const [base, qs = ""] = zonesTilesTemplate.split("?");
          src.setTiles([`${base}?${qs}&v=${v}`]);
        } else {
          map.triggerRepaint();
        }
      } catch {}
    };
    map.on("error", onError);
    return () => map.off("error", onError);
  }, [zonesTilesTemplate]);

  // Basemap
  const {
    data: baseMapData,
    isLoading: baseMapLoading,
    error: baseMapError,
  } = useLocalityShapefileQuery(baseMapId);
  useEffect(() => {
    const t = setTimeout(() => mapGLRef.current?.resize?.(), 50);
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
    if (baseMapData) setBaseMapBounds(fcToBounds(baseMapData));
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

  const zoneIdForQuery = useMemo(
    () => (isServerId(activeZone) ? activeZone! : undefined),
    [activeZone]
  );
  const { data: zoneDetail } = useZoneDetailQuery(zoneIdForQuery);

  // ---- dynamic legend counts ----
  const [countsByType, setCountsByType] = useState<Record<string, number>>({});
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number>>(
    {}
  );

  const recomputeLegendCounts = useCallback(() => {
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    if (!map || !map.isStyleLoaded() || !map.getSource("zones-tiles")) return;

    let feats: any[] = [];
    try {
      feats = map.querySourceFeatures("zones-tiles", { sourceLayer: "zones" });
    } catch {
      return;
    }

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const f of feats) {
      const lu = String(f.properties?.land_use ?? "");
      const st =
        f.state?.status ||
        f.properties?.status ||
        "Draft"; // feature-state overrides, else props
      if (lu) byType[lu] = (byType[lu] || 0) + 1;
      if (st) byStatus[st] = (byStatus[st] || 0) + 1;
    }
    setCountsByType(byType);
    setCountsByStatus(byStatus);
  }, []);

  useEffect(() => {
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    if (!map) return;
    const refresh = () => recomputeLegendCounts();
    map.on("idle", refresh);
    map.on("moveend", refresh);
    map.on("data", refresh);
    return () => {
      map.off("idle", refresh);
      map.off("moveend", refresh);
      map.off("data", refresh);
    };
  }, [recomputeLegendCounts, isMapLoaded]);

  useEffect(() => {
    if (isMapLoaded) recomputeLegendCounts();
  }, [isMapLoaded, landUses, recomputeLegendCounts]);

  // ---- API mutations ----
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
      recomputeLegendCounts();
    },
  });

  const deleteZone = useDeleteZone({
    onDone: () => {
      const mapRef = mapGLRef.current;
      const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
      const src: any = map?.getSource("zones-tiles");
      if (src?.setTiles) {
        const v = Date.now();
        const [base, qs = ""] = zonesTilesTemplate.split("?");
        src.setTiles([`${base}?${qs}&v=${v}`]);
      }
      if (activeZone) setActiveZone(null);
      recomputeLegendCounts();
    },
  });

  const approve = useCallback(() => {
    if (!activeZone) return;
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    map?.setFeatureState(
      {
        source: "zones-tiles",
        sourceLayer: "zones",
        id: Number(activeZone) || activeZone,
      },
      { status: "Approved" }
    );
    updateStatus.mutate({ id: activeZone, status: "Approved" });
  }, [activeZone, updateStatus]);

  const reject = useCallback(() => {
    if (!activeZone) return;
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    map?.setFeatureState(
      {
        source: "zones-tiles",
        sourceLayer: "zones",
        id: Number(activeZone) || activeZone,
      },
      { status: "Rejected" }
    );
    updateStatus.mutate({ id: activeZone, status: "Rejected" });
  }, [activeZone, updateStatus]);

  const remove = useCallback(() => {
    if (!activeZone) return;
    deleteZone.mutate(activeZone);
    toast.success(`Zone ${activeZone} deleted`);
  }, [activeZone, deleteZone]);

  /* ------------------------------ Draw: setup/modes ------------------------------ */
  const initDraw = useCallback(() => {
    const mapRef = mapGLRef.current;
    if (!mapRef) return;
    const map = mapRef.getMap ? mapRef.getMap() : mapRef;
    if (drawRef.current) return;
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: "simple_select",
    });
    map.addControl(draw as any, "top-left");
    drawRef.current = draw;

    map.on("draw.create", (e: any) => {
      const feats = e.features || [];
      setDrawStates((prev) => {
        const next = new globalThis.Map(prev);
        feats.forEach((f: any) => {
          const id = String(f.id || f.properties?.id || Date.now());
          f.properties = {
            ...(f.properties || {}),
            status: f.properties?.status || "Draft",
            locality: baseMapId ? Number(baseMapId) : undefined,
            land_use: f.properties?.land_use ?? defaultLandUseId ?? undefined,
          };
          next.set(id, { feature: f, state: "added", original: null });
          setActiveZone(id);
        });
        return next;
      });
    });

    map.on("draw.update", (e: any) => {
      const feats = e.features || [];
      setDrawStates((prev) => {
        const next = new Map(prev);
        feats.forEach((f: any) => {
          const id = String(f.id || f.properties?.id || Date.now());
          const existing = next.get(id) || prev.get(id);
          if (existing?.state === "added")
            next.set(id, {
              feature: f,
              state: "added",
              original: existing.original,
            });
          else
            next.set(id, {
              feature: f,
              state: "edited",
              original: existing?.original || f,
            });
        });
        return next;
      });
    });

    map.on("draw.delete", (e: any) => {
      const feats = e.features || [];
      setDrawStates((prev) => {
        const next = new Map(prev);
        feats.forEach((f: any) => {
          const id = String(f.id || f.properties?.id || Date.now());
          const existing = next.get(id);
          if (existing?.state === "added") next.delete(id);
          else
            next.set(id, {
              feature: f,
              state: "deleted",
              original: existing?.original || f,
            });
        });
        return next;
      });
    });
  }, [baseMapId, defaultLandUseId]);

  const setDrawMode = useCallback(
    (mode: "simple_select" | "draw_polygon" | "direct_select" | "trash") => {
      const draw = drawRef.current;
      if (!draw) return;
      if (mode === "trash") {
        draw.trash();
        return;
      }
      (draw as any).changeMode(mode);
    },
    []
  );

  const editActiveZoneInDraw = useCallback(async () => {
    if (!activeZone) return;
    const draw = drawRef.current;
    const mapRef = mapGLRef.current;
    if (!draw || !mapRef) return;
    if (!zoneDetail) {
      toast.error("Zone detail not loaded yet");
      return;
    }
    const feature = {
      type: "Feature",
      id: Number(activeZone) || activeZone,
      properties: {
        id: Number(activeZone) || activeZone,
        land_use: zoneDetail.land_use,
        locality: zoneDetail.locality,
        status: zoneDetail.status || "Draft",
        color: (zoneDetail as any).color,
      },
      geometry: zoneDetail.geom,
    };
    try {
      draw.add(feature as any);
      (draw as any).changeMode("direct_select", { featureId: feature.id });
      setDrawStates((prev) => {
        const next = new Map(prev);
        next.set(String(feature.id), {
          feature,
          state: "edited",
          original: feature,
        });
        return next;
      });
      setSelectedTool("edit");
    } catch {
      toast.error("Failed to add feature to editor");
    }
  }, [activeZone, zoneDetail]);

  const onSaveDrawChanges = useCallback(async () => {
    const arr = Array.from(drawStates.entries());
    if (!arr.length) {
      toast.info("No changes to save");
      return;
    }
    const features = arr.map(([, s]) => {
      const props: any = {
        ...(typeof s.feature.id === "number" ? { id: s.feature.id } : {}),
        locality: baseMapId ? Number(baseMapId) : undefined,
        land_use: s.feature.properties?.land_use,
        status: s.feature.properties?.status ?? "Draft",
      };
      return {
        type: "Feature",
        id: props.id,
        properties: props,
        geometry: ensureMultiPolygon(s.feature.geometry),
      };
    });
    const missingMeta = features.some(
      (f) => !f.properties.land_use || !f.properties.locality
    );
    if (missingMeta) {
      toast.error("Please choose Land Use before saving.");
      return;
    }
    const body = { type: "FeatureCollection", features };
    try {
      await api.post("/zoning/zones/bulk/", body);
      toast.success("Changes saved");
      setDrawStates(new Map());
      try {
        drawRef.current?.deleteAll();
      } catch {}
      const mapRef = mapGLRef.current;
      const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
      const src: any = map?.getSource("zones-tiles");
      if (src?.setTiles) {
        const v = Date.now();
        const [base, qs = ""] = zonesTilesTemplate.split("?");
        src.setTiles([`${base}?${qs}&v=${v}`]);
      }
      recomputeLegendCounts();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Save failed");
    }
  }, [drawStates, baseMapId, zonesTilesTemplate, recomputeLegendCounts]);

  const assignLandUseToDrawFeature = useCallback(
    (zoneId: string | number, landUse: LandUseDto) => {
      const idStr = String(zoneId);
      setDrawStates((prev) => {
        const next = new Map(prev);
        const s = next.get(idStr);
        if (!s) return prev;
        const updated = {
          ...s,
          feature: {
            ...s.feature,
            properties: {
              ...(s.feature.properties || {}),
              land_use: landUse.id,
              land_use_name: landUse.name,
              color: landUse.color || s.feature.properties?.color,
            },
          },
        };
        next.set(idStr, updated);
        try {
          drawRef.current?.setFeatureProperty(
            s.feature.id,
            "land_use",
            landUse.id
          );
          drawRef.current?.setFeatureProperty(
            s.feature.id,
            "land_use_name",
            landUse.name
          );
          if (landUse.color)
            drawRef.current?.setFeatureProperty(
              s.feature.id,
              "color",
              landUse.color
            );
        } catch {}
        return next;
      });
      toast.success("Land Use assigned");
    },
    []
  );

  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    initDraw();
  }, [initDraw]);

  const onMapClick = useCallback(
    (e: any) => {
      if (selectedTool === "draw" || selectedTool === "edit") return;
      const mapRef = mapGLRef.current;
      const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
      const f = map?.queryRenderedFeatures(e.point, {
        layers: ["zones-fill"],
      })?.[0];
      if (!f) return;
      const id = f.id ?? f.properties?.id;
      if (id !== undefined && id !== null) setActiveZone(String(id));
    },
    [selectedTool]
  );

  /* ----------------------- REGISTER STYLES INTO MAPBOX ----------------------- */
  useEffect(() => {
    if (!isMapLoaded || !landUses?.length) return;
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    if (!map) return;

    const { solidColorByLU, patternByLU, badgeByLU } =
      parseLandUseStyles(landUses);

    // Register pattern images once per key
    for (const [, patt] of patternByLU.entries()) {
      const name = `lu-pattern-${patt.key}`;
      if (!map.hasImage(name)) {
        const canvas = makeCanvas(32, 32);
        patt.draw(canvas);
        map.addImage(name, canvas, { pixelRatio: 1 });
      }
    }

    // Build expressions
    const colorPairs: any[] = [];
    solidColorByLU.forEach((color, id) => colorPairs.push(id, color));
    const baseColorExpr = colorPairs.length
      ? [
          "match",
          ["get", "land_use"],
          ...colorPairs,
          ["coalesce", ["get", "color"], "#6b7280"],
        ]
      : ["coalesce", ["get", "color"], "#6b7280"];

    const patternPairs: any[] = [];
    patternByLU.forEach((patt, id) =>
      patternPairs.push(id, `lu-pattern-${patt.key}`)
    );
    const patternExpr = patternPairs.length
      ? ["match", ["get", "land_use"], ...patternPairs, null]
      : null;

    // Status override color
    const statusColorExpr = [
      "case",
      ["==", ["feature-state", "status"], "Approved"],
      "#22c55e",
      ["==", ["feature-state", "status"], "Rejected"],
      "#dc2626",
      ["==", ["get", "status"], "Approved"],
      "#22c55e",
      ["==", ["get", "status"], "Rejected"],
      "#dc2626",
      ["==", ["get", "status"], "In Review"],
      "#f59e0b",
      baseColorExpr,
    ];

    try {
      map.setPaintProperty("zones-fill", "fill-color", statusColorExpr);
      map.setPaintProperty("zones-fill", "fill-opacity", 0.5);
      map.setPaintProperty("zones-fill", "fill-pattern", patternExpr);
    } catch {}

    // Badges layer
    if (!map.getLayer("zones-badges")) {
      map.addLayer(
        {
          id: "zones-badges",
          type: "symbol",
          source: "zones-tiles",
          "source-layer": "zones",
          layout: {
            "text-field": "",
            "text-size": 11,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-allow-overlap": true,
            "text-ignore-placement": true,
            "symbol-placement": "point",
          },
          paint: {
            "text-halo-color": "#fff",
            "text-halo-width": 1.2,
            "text-color": "#083F2A",
          },
        },
        "zones-line"
      );
    }

    const badgePairs: any[] = [];
    badgeByLU.forEach((b, id) => {
      if (b.text) badgePairs.push(id, String(b.text));
    });
    const textExpr = badgePairs.length
      ? ["match", ["get", "land_use"], ...badgePairs, ""]
      : "";

    try {
      map.setLayoutProperty("zones-badges", "text-field", textExpr);
    } catch {}
  }, [isMapLoaded, landUses]);

  /* ------------------------------------ UI ------------------------------------ */
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {isLoading && (
        <div className="h-1 bg-muted relative overflow-hidden shrink-0">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">Selection:</span>
          <Button
            type="button"
            variant={selectedTool === "select" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setSelectedTool("select");
              setDrawMode("simple_select");
            }}
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
            onClick={() => {
              setSelectedTool("draw");
              setDrawMode("draw_polygon");
            }}
            className="h-8 px-2"
          >
            <Square className="w-4 h-4 mr-1" /> Polygon
          </Button>
          <Button
            type="button"
            variant={selectedTool === "edit" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setSelectedTool("edit");
              setDrawMode("direct_select");
            }}
            className="h-8 px-2"
          >
            <Edit3 className="w-4 h-4 mr-1" /> Vertices
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDrawMode("trash")}
            className="h-8 px-2"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!activeZone || !!Number(activeZone) === false}
            onClick={editActiveZoneInDraw}
            className="h-8 px-2"
            title={
              activeZone
                ? "Load selected zone into editor"
                : "Select a zone on the map first"
            }
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
            <SaveIcon className="w-4 h-4 mr-1" /> Save (
            {Array.from(drawStates.values()).length})
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Type</span>
          <Switch
            checked={colorMode === "status"}
            onCheckedChange={(c) => onColorModeChange(c ? "status" : "type")}
          />
          <span className="text-sm text-muted-foreground">Status</span>

          {onMaximizeToggle && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onMaximizeToggle}
              className="h-8 px-2 ml-2"
            >
              {isMaximized ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 3-pane layout */}
      <div className="flex-1 min-h-0 flex">
        {/* Left Panel */}
        <div
          className={`transition-all duration-300 border-r bg-card ${
            leftPanelOpen ? "w-80" : "w-0"
          } overflow-hidden shrink-0 flex flex-col min-h-0`}
        >
          <div className="p-4 h-full flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3>Zone Tools</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLeftPanelOpen(false)}
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>

            {/* Dynamic legend */}
            <ZoneLegend
              colorMode={colorMode}
              landUses={landUses}
              countsByType={countsByType}
              countsByStatus={countsByStatus as any}
            />

            <Separator className="my-4" />
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative min-h-0 overflow-hidden">
          {!leftPanelOpen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm shadow-lg"
              onClick={() => setLeftPanelOpen(true)}
            >
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setLayersOpen(!layersOpen)}
                    className="p-0"
                  >
                    {layersOpen ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {layersOpen && (
                <CardContent className="pt-0 space-y-3 max-h-80 overflow-y-auto">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Basemap</span>
                      <Switch
                        checked={layerVisibility.basemap}
                        onCheckedChange={() =>
                          setLayerVisibility((p) => ({
                            ...p,
                            basemap: !p.basemap,
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* The map */}
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
                          // Ensure coordinates are arrays and type is correct
                          coordinates: f.geometry.coordinates,
                          type: f.geometry.type,
                        },
                        properties: f.properties ?? {},
                      })),
                    } as GeoJSON.FeatureCollection<GeoJSON.Geometry>
                  }
                >
                  <Layer
                    id="basemap-fill"
                    type="fill"
                    layout={{
                      visibility: layerVisibility.basemap ? "visible" : "none",
                    }}
                    paint={{
                      "fill-color": "#3b82f6",
                      "fill-opacity": (layerOpacity.basemap ?? 30) / 100,
                    }}
                  />
                  <Layer
                    id="basemap-line"
                    type="line"
                    layout={{
                      visibility: layerVisibility.basemap ? "visible" : "none",
                    }}
                    paint={{
                      "line-color": "#2563eb",
                      "line-width": 1.2,
                      "line-opacity": 0.9,
                    }}
                  />
                </Source>
              )}

              {/* ZONES VIA MVT */}
              <Source
                id="zones-tiles"
                type="vector"
                tiles={[zonesTilesTemplate]}
                minzoom={1}
                maxzoom={22}
                promoteId="id"
              >
                <Layer
                  id="zones-fill"
                  type="fill"
                  source-layer="zones"
                  paint={{
                    // Will be overridden by useEffect after styles are parsed
                    "fill-color": ["coalesce", ["get", "color"], "#6b7280"],
                    "fill-opacity": 0.5,
                  }}
                />
                <Layer
                  id="zones-line"
                  type="line"
                  source-layer="zones"
                  paint={{ "line-color": "#1f2937", "line-width": 0.75 }}
                />
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
                  Basemap:{" "}
                  {baseMapLoading
                    ? "Loading…"
                    : baseMapError
                    ? "Error"
                    : "Loaded"}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Pending changes: {Array.from(drawStates.values()).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-72 border-l bg-card shrink-0 flex flex-col min-h-0">
          <Tabs
            value={rightPanelTab}
            onValueChange={setRightPanelTab}
            className="flex-1 flex flex-col min_h-0"
          >
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
                    zones={(() => {
                      const z: any[] = [];
                      if (zoneDetail) {
                        z.push({
                          id: zoneDetail.id,
                          type: String(
                            zoneDetail.land_use_name ||
                              zoneDetail.land_use ||
                              ""
                          ),
                          status: zoneDetail.status || "Draft",
                          color: (zoneDetail as any).color || "#888",
                          coordinates: getOuterRing(zoneDetail.geom),
                          notes: (zoneDetail as any).notes,
                          attributes: {},
                          lastModified: zoneDetail.updated_at?.slice(0, 10),
                        });
                      } else if (
                        activeZone &&
                        drawStates.get(String(activeZone))
                      ) {
                        const s = drawStates.get(String(activeZone))!;
                        z.push({
                          id: activeZone,
                          type: s.feature?.properties?.land_use_name || "",
                          status: s.feature?.properties?.status || "Draft",
                          color: s.feature?.properties?.color || "#888",
                          coordinates: getOuterRing(s.feature?.geometry),
                          notes: "",
                          attributes: {},
                          lastModified: "",
                        });
                      }
                      return z;
                    })()}
                    onUpdateZone={() => {}}
                    conflicts={[]}
                    landUses={landUses}
                    onAssignLandUse={assignLandUseToDrawFeature}
                    isNewZone={
                      !!(activeZone && drawStates.get(String(activeZone)))
                    }
                    // API actions
                    onApprove={approve}
                    onReject={reject}
                    onDelete={remove}
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
