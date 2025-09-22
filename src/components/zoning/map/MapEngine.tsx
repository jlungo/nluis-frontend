import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
// @ts-ignore
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import proj4 from "proj4";
import api, { getAccessToken, refreshAccessToken } from "@/lib/axios";
import { toast } from "sonner";
import { useLocalityShapefileQuery } from "@/queries/useLocalityQuery";
import { useLandUsesQuery, LandUseDto } from "@/queries/useSetupQuery";
import {
  useZoneDetailQuery,
  useUpdateZoneStatus,
  useDeleteZone,
} from "@/queries/useZoningQuery";
import { useZoningStore } from "../store/useZoningStore";
import { parseLandUseStyles } from "./useLandUseStyles";
import {
  ensureMultiPolygon,
  closeRing,
  fcToBounds,
  getOuterRing,
} from "../utils/geo";
import AddPointsDialog, {
  CoordMode,
  PointRow,
} from "../points/AddPointsDialog";

const MAPBOX_STYLE = "mapbox://styles/mapbox/streets-v11";
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiY3Jlc2NlbnRzYW1iaWxhIiwiYSI6ImNtZWx5ZXR4OTA5Y3gyanNkOHM0cjFtN2sifQ.RC22kROvjoVE5LdsCSPSsA";

type DrawState = "added" | "edited" | "deleted";
type DrawFeatureState = {
  feature: any;
  state: DrawState;
  original?: any | null;
};

const isServerId = (id: string | null): boolean =>
  !!id && Number.isFinite(Number(id));

type Props = {
  baseMapId?: string;
  defaultLandUseId?: number;
  colorMode?: "type" | "status";
};

export default function MapEngine({ baseMapId, defaultLandUseId, colorMode = "type" }: Props) {
  const mapGLRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawRef = useRef<any>(null);
  // client-side hide list (e.g., after delete) to mask features until tiles update
  const hiddenIdsRef = useRef<Set<string | number>>(new Set());

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [baseMapBounds, setBaseMapBounds] = useState<
    [[number, number], [number, number]] | null
  >(null);

  const [drawStates, setDrawStates] = useState<Map<string, DrawFeatureState>>(
    new globalThis.Map()
  );
  const [activeZone, setActiveZone] = useState<string | null>(null);
  //   drawing state
  const [activeDrawMode, setActiveDrawMode] = useState<
    | "simple_select"
    | "draw_point"
    | "draw_line_string"
    | "draw_polygon"
    | "direct_select"
  >("simple_select");

  // Points dialog
  const [pointsOpen, setPointsOpen] = useState(false);

  // Store hooks
  const setCounts = useZoningStore((s) => s.setCounts);
  const basemapVisible = useZoningStore((s) => s.basemapVisible);
  const labelsVisible = useZoningStore((s) => s.labelsVisible);
  const labelField = useZoningStore((s) => s.labelField);
  const setStatusBar = useZoningStore((s) => s.setStatusBar);
  const setActiveZoneInStore = useZoningStore((s) => s.setActiveZone);
  const setConflicts = useZoningStore((s) => s.setConflicts);
  const setAPI = useZoningStore((s) => s.setAPI);

  // Data
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

  // Basemap GeoJSON + bounds
  const { data: baseMapData } = useLocalityShapefileQuery(baseMapId);
  useEffect(() => {
    if (baseMapData) setBaseMapBounds(fcToBounds(baseMapData));
  }, [baseMapData]);

  // Zone detail when server id selected
  const zoneIdForQuery = useMemo(
    () => (isServerId(activeZone) ? activeZone! : undefined),
    [activeZone]
  );
  const { data: zoneDetail } = useZoneDetailQuery(zoneIdForQuery);

  // Errors: refresh token on 401 tile error
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

  // Map load
  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    initDraw();

    // fit to basemap bounds
    const mapRef = mapGLRef.current;
    try {
      // Disable default double-click zoom so we can use double-click for edit
      (mapRef?.getMap?.() || mapRef)?.doubleClickZoom?.disable?.();
    } catch {}
    if (baseMapBounds) {
      (mapRef.fitBounds || mapRef.getMap()?.fitBounds)?.(
        [
          [baseMapBounds[0][0], baseMapBounds[0][1]],
          [baseMapBounds[1][0], baseMapBounds[1][1]],
        ],
        { padding: 24, duration: 800 }
      );
    }
  }, [baseMapBounds]);

  // Mouse move → status bar
  useEffect(() => {
    const map = mapGLRef.current?.getMap?.() || mapGLRef.current;
    if (!map) return;
    const handler = (e: any) => {
      const { lngLat } = e;
      const ll: [number, number] = [lngLat.lng, lngLat.lat];
      try {
        const utm = proj4("EPSG:4326", "EPSG:32737", ll);
        setStatusBar(ll, utm as [number, number], map.getZoom());
      } catch {
        setStatusBar(ll, undefined, map.getZoom());
      }
    };
    map.on("mousemove", handler);
    return () => map.off("mousemove", handler);
  }, [setStatusBar]);

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
    map.on("draw.modechange", (e: any) => {
      setActiveDrawMode(e?.mode || "simple_select");
    });

    map.on("draw.create", (e: any) => {
      const feats = e.features || [];
      setDrawStates((prev) => {
        const next = new Map(prev);
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
          try {
            (drawRef.current as any)?.changeMode("direct_select", {
              featureId: f.id,
            });
          } catch {}
          // Update right panel summary for newly created feature
          try {
            setActiveZoneInStore(
              id,
              {
                id,
                type: f.properties?.land_use_name || "",
                status: f.properties?.status || "Draft",
                color: f.properties?.color || "#888",
                coordinates: getOuterRing(f.geometry),
                notes: "",
              },
              true
            );
          } catch {}
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

  // (autosave removed per request)

  // legend counts
  const recomputeLegendCounts = useCallback(() => {
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    if (!map || !map.isStyleLoaded() || !map.getSource("zones-tiles")) return;
    let feats: any[] = [];
    try {
      feats = map.querySourceFeatures("zones-tiles", { sourceLayer: "zones" });
    } catch {
      // ignore here, will fallback below
    }
    // Fallback: if source features empty, use rendered features on the fill layer
    if (!feats || feats.length === 0) {
      try {
        feats = map.queryRenderedFeatures({ layers: ["zones-fill"] }) as any[];
      } catch {}
    }

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    // Build a set of IDs that currently exist in the Draw editor so we don't double count them
    const drawEntries = Array.from(drawStates.values());
    const drawIds = new Set<string | number>();
    for (const { feature } of drawEntries) {
      const fid = (feature && (feature.id ?? feature.properties?.id)) as any;
      if (fid !== undefined && fid !== null) drawIds.add(Number(fid) || String(fid));
    }
    // Count server tiles, excluding any id currently present in Draw
    for (const f of feats) {
      const fid = (f.id ?? f.properties?.id) as any;
      const idKey = fid !== undefined && fid !== null ? (Number(fid) || String(fid)) : undefined;
      if (idKey !== undefined && drawIds.has(idKey)) continue; // skip to avoid double-count
      const p = f.properties || {};
      const lu = String(p.land_use ?? p.land_use_id ?? p.landuse ?? p.lu ?? "");
      const st = (f.state?.status || p.status || p.zone_status || "Draft") as string;
      if (lu) byType[lu] = (byType[lu] || 0) + 1;
      if (st) byStatus[st] = (byStatus[st] || 0) + 1;
    }
    // Then add Draw features once
    for (const { feature } of drawEntries) {
      const p = feature?.properties || {};
      const lu = String(p.land_use ?? p.land_use_id ?? p.landuse ?? p.lu ?? "");
      const st = (p.status || p.zone_status || "Draft") as string;
      if (lu) byType[lu] = (byType[lu] || 0) + 1;
      if (st) byStatus[st] = (byStatus[st] || 0) + 1;
    }
    setCounts(byType, byStatus);
  }, [setCounts, drawStates]);

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
  }, [isMapLoaded, landUses, drawStates, recomputeLegendCounts]);

  // API mutations
  const updateStatus = useUpdateZoneStatus({ onDone: refreshZones });
  const deleteZone = useDeleteZone({
    onDone: () => {
      refreshZones();
      if (activeZone) setActiveZone(null);
    },
  });

  function refreshZones() {
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    const src: any = map?.getSource("zones-tiles");
    if (src?.setTiles) {
      const v = Date.now();
      const [base, qs = ""] = zonesTilesTemplate.split("?");
      src.setTiles([`${base}?${qs}&v=${v}`]);
    }
    // Clear any temporary client-side hidden ids once we request fresh tiles
    hiddenIdsRef.current.clear();
    try {
      map?.setFilter("zones-fill", undefined);
      map?.setFilter("zones-line", undefined);
    } catch {}
    recomputeLegendCounts();
  }

  // single-zone status helpers (used by menu via API)
  const approve = useCallback(() => {
    if (!activeZone) return;
    const map = mapGLRef.current?.getMap?.() || mapGLRef.current;
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
    const map = mapGLRef.current?.getMap?.() || mapGLRef.current;
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

  const sendToDraft = useCallback(() => {
    if (!activeZone) return;
    const map = mapGLRef.current?.getMap?.() || mapGLRef.current;
    map?.setFeatureState(
      {
        source: "zones-tiles",
        sourceLayer: "zones",
        id: Number(activeZone) || activeZone,
      },
      { status: "Draft" }
    );
    updateStatus.mutate({ id: activeZone, status: "Draft" });
  }, [activeZone, updateStatus]);

  const remove = useCallback(() => {
    if (!activeZone) return;
    deleteZone.mutate(activeZone);
    toast.success(`Zone ${activeZone} deleted`);
    // Immediately hide the feature from current render by filtering it out
    try {
      const map = mapGLRef.current?.getMap?.() || mapGLRef.current;
      hiddenIdsRef.current.add(Number(activeZone) || activeZone);
      const ids = Array.from(hiddenIdsRef.current);
      const filter = [
        "all",
        ["!in", ["id"], ["literal", ids]],
      ] as any;
      map?.setFilter("zones-fill", filter);
      map?.setFilter("zones-line", filter);
    } catch {}
  }, [activeZone, deleteZone]);

  // assign LU for new/edit features (draw)
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

  // Save changes to API
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
      refreshZones();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Save failed");
    }
  }, [drawStates, baseMapId]);

  // Save As (local)
  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const saveAsGeoJSON = useCallback(() => {
    const feats = Array.from(drawStates.values()).map(({ feature }) => ({
      type: "Feature" as const,
      properties: { ...feature.properties, id: feature.id },
      geometry: ensureMultiPolygon(feature.geometry),
    }));
    const fc = { type: "FeatureCollection" as const, features: feats };
    const blob = new Blob([JSON.stringify(fc)], {
      type: "application/geo+json",
    });
    downloadBlob(blob, `project-export-${Date.now()}.geojson`);
  }, [drawStates]);

  const saveAsShapefile = useCallback(async () => {
    try {
      // @ts-ignore
      const shpWrite = await import("shp-write");
      const feats = Array.from(drawStates.values()).map(({ feature }) => ({
        type: "Feature" as const,
        properties: { ...feature.properties, id: feature.id },
        geometry: ensureMultiPolygon(feature.geometry),
      }));
      const fc = { type: "FeatureCollection" as const, features: feats };
      const options = { folder: "project", types: { polygon: "zones" } } as any;
      const zipBlob: Blob = (shpWrite.zip(fc, options) as unknown) as Blob;
      downloadBlob(zipBlob, `project-export-${Date.now()}.zip`);
    } catch (e) {
      toast.error("Shapefile export failed (is 'shp-write' installed?)");
    }
  }, [drawStates]);

  // expose API to store (menus/toolbar)
  useEffect(() => {
    setAPI({
      // saving
      saveToAPI: onSaveDrawChanges,
      saveAsGeoJSON,
      saveAsShapefile,
      // dialogs / toggles
      openAddPoints: () => setPointsOpen(true),
      toggleLabels: (v: boolean) => {
        updateLabelsVisibility(v);
      },
      setLabelField: (f) => {
        updateLabelsField(f);
      },
      // selection helpers for menus
      getSelectedIds: () => (activeZone ? [activeZone] : []),
      // allow toolbar to switch back to selection tool
      startSelect: () => {
        const draw = drawRef.current;
        if (!draw) return;
        try {
          (draw as any).changeMode("simple_select");
        } catch {}
      },
      // assign LU to currently active drawn feature from RightDock
      assignLandUseToActive: (luId: number) => {
        if (!activeZone) return;
        const lu = landUses.find((x) => x.id === luId);
        if (!lu) return;
        assignLandUseToDrawFeature(activeZone, lu);
      },
      // direct actions for panels
      approve: approve,
      reject: reject,
      // edit selected server/client feature
      editSelectedFeatures: () => {
        const map = mapGLRef.current?.getMap?.() || mapGLRef.current;
        const draw = drawRef.current;
        if (!activeZone || !map || !draw) {
          toast.error("Select a zone first");
          return;
        }
        // if server feature -> use zoneDetail
        if (isServerId(activeZone)) {
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
            (draw as any).changeMode("direct_select", {
              featureId: feature.id,
            });
            setDrawStates((prev) => {
              const next = new Map(prev);
              next.set(String(feature.id), {
                feature,
                state: "edited",
                original: feature,
              });
              return next;
            });
            toast.success("Loaded feature into editor");
          } catch {
            toast.error("Failed to add feature to editor");
          }
        } else {
          // client feature already exists in draw; just enter direct_select
          try {
            (draw as any).changeMode("direct_select", {
              featureId: activeZone,
            });
          } catch {}
        }
      },
      startDrawPoint: () => {
        const draw = drawRef.current;
        if (!draw) return;
        (draw as any).changeMode("draw_point");
        toast.message?.("Draw point: click on the map.");
      },
      startDrawLine: () => {
        const draw = drawRef.current;
        if (!draw) return;
        (draw as any).changeMode("draw_line_string");
        toast.message?.(
          "Draw line: click to add vertices, double-click to finish."
        );
      },
      startDrawPolygon: () => {
        const draw = drawRef.current;
        if (!draw) return;
        (draw as any).changeMode("draw_polygon");
        toast.message?.(
          "Draw polygon: click to add vertices, double-click to finish."
        );
      },
      // approvals
      approveSelected: approve,
      rejectSelected: reject,
      sendToDraftSelected: sendToDraft,
      // optional
      deleteZone: remove,
      focusLayersPanel: () => {},
      // conflicts resolution API (backend-powered)
      resolveTrim: async (withId?: string | number) => {
        if (!activeZone) return;
        try {
          await api.post(`/zoning/zones/${activeZone}/resolve/`, {
            action: "trim",
            with: withId ? Number(withId) : undefined,
          });
          toast.success("Trimmed overlap");
          // clear conflicts display and refresh tiles
          try {
            const src: any = mapGLRef.current?.getMap?.()?.getSource("conflicts-src");
            src?.setData({ type: "FeatureCollection", features: [] });
          } catch {}
          setConflicts([]);
          refreshZones();
        } catch (e: any) {
          toast.error(e?.response?.data?.detail || "Trim failed");
        }
      },
      resolveSplit: async (withIds?: Array<string | number>) => {
        if (!activeZone) return;
        try {
          await api.post(`/zoning/zones/${activeZone}/resolve/`, {
            action: "split",
            with: (withIds || []).map((v) => Number(v)),
          });
          toast.success("Created split zones");
          try {
            const src: any = mapGLRef.current?.getMap?.()?.getSource("conflicts-src");
            src?.setData({ type: "FeatureCollection", features: [] });
          } catch {}
          setConflicts([]);
          refreshZones();
        } catch (e: any) {
          toast.error(e?.response?.data?.detail || "Split failed");
        }
      },
      resolveIgnore: async (withIds?: Array<string | number>) => {
        if (!activeZone) return;
        try {
          await api.post(`/zoning/zones/${activeZone}/resolve/`, {
            action: "ignore",
            with: (withIds || []).map((v) => Number(v)),
          });
          toast.info("Ignored conflict");
          try {
            const src: any = mapGLRef.current?.getMap?.()?.getSource("conflicts-src");
            src?.setData({ type: "FeatureCollection", features: [] });
          } catch {}
          setConflicts([]);
        } catch (e: any) {
          toast.error(e?.response?.data?.detail || "Ignore failed");
        }
      },
    });
  }, [
    setAPI,
    onSaveDrawChanges,
    saveAsGeoJSON,
    saveAsShapefile,
    approve,
    reject,
    sendToDraft,
    remove,
    activeZone,
    zoneDetail,
    landUses,
    assignLandUseToDrawFeature,
    refreshZones,
    setConflicts,
  ]);

  // click to select
  const onMapClick = useCallback(
    async (e: any) => {
         if (activeDrawMode !== "simple_select") return; // <-- add this line
      const mapRef = mapGLRef.current;
      const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
      const f = map?.queryRenderedFeatures(e.point, {
        layers: ["zones-fill"],
      })?.[0];
      if (!f) return;
      const id = f.id ?? f.properties?.id;
      if (id === undefined || id === null) return;
      const idStr = String(id);
      setActiveZone(idStr);
      // Fetch conflicts from backend and render overlaps
      try {
        const qs = new URLSearchParams();
        if (baseMapId) qs.set("locality", baseMapId);
        const { data } = await api.get(`/zoning/zones/${idStr}/conflicts/?${qs.toString()}`);
        const overlaps = data?.overlaps || { type: "FeatureCollection", features: [] };
        const conflictsList = data?.conflicts || [];
        try {
          const src: any = map?.getSource("conflicts-src");
          src?.setData(overlaps);
        } catch {}
        // Store a minimal conflicts list compatible with our UI store
        setConflicts([{ id: idStr, with: conflictsList.map((c: any) => c.id) }]);
      } catch {
        try {
          const src: any = map?.getSource("conflicts-src");
          src?.setData({ type: "FeatureCollection", features: [] });
        } catch {}
        setConflicts([]);
      }

      // Build summary for right panel (server or client feature)
      if (isServerId(idStr) && zoneDetail) {
        setActiveZoneInStore(
          idStr,
          {
            id: zoneDetail.id,
            type: String(zoneDetail.land_use_name || zoneDetail.land_use || ""),
            status: zoneDetail.status || "Draft",
            color: (zoneDetail as any).color || "#888",
            coordinates: getOuterRing(zoneDetail.geom),
            notes: (zoneDetail as any).notes,
            lastModified: zoneDetail.updated_at?.slice(0, 10),
          },
          false
        );
      } else {
        const s = drawStates.get(idStr);
        if (s) {
          setActiveZoneInStore(
            idStr,
            {
              id: idStr,
              type: s.feature?.properties?.land_use_name || "",
              status: s.feature?.properties?.status || "Draft",
              color: s.feature?.properties?.color || "#888",
              coordinates: getOuterRing(s.feature?.geometry),
              notes: "",
            },
            true
          );
        }
      }
    },
    [zoneDetail, drawStates, setActiveZoneInStore, setConflicts]
  );

  // Double-click to activate edit on a layer
  const onMapDoubleClick = useCallback(
    (e: any) => {
      const mapRef = mapGLRef.current;
      const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
      const f = map?.queryRenderedFeatures(e.point, { layers: ["zones-fill"] })?.[0];
      if (!f) return;
      const id = f.id ?? f.properties?.id;
      if (id === undefined || id === null) return;
      const idStr = String(id);
      setActiveZone(idStr);
      // Try to enter edit mode for client feature; else use server edit path
      const draw = drawRef.current;
      if (!isServerId(idStr) && draw) {
        try {
          (draw as any).changeMode("direct_select", { featureId: idStr });
          return;
        } catch {}
      }
      // Fallback to full editSelectedFeatures flow (uses zoneDetail when ready)
      try {
        // Reuse the same internal logic via API object
        // (this will toast if detail isn't ready yet)
        const apiTmp = {
          editSelectedFeatures: () => {
            const drawLocal = drawRef.current;
            const mapLocal = mapGLRef.current?.getMap?.() || mapGLRef.current;
            if (!idStr || !mapLocal || !drawLocal) {
              toast.error("Select a zone first");
              return;
            }
            if (isServerId(idStr)) {
              if (!zoneDetail) {
                toast.error("Zone detail not loaded yet");
                return;
              }
              const feature = {
                type: "Feature",
                id: Number(idStr) || idStr,
                properties: {
                  id: Number(idStr) || idStr,
                  land_use: zoneDetail.land_use,
                  locality: zoneDetail.locality,
                  status: zoneDetail.status || "Draft",
                  color: (zoneDetail as any).color,
                },
                geometry: zoneDetail.geom,
              } as any;
              try {
                drawLocal.add(feature);
                (drawLocal as any).changeMode("direct_select", { featureId: feature.id });
                setDrawStates((prev) => {
                  const next = new Map(prev);
                  next.set(String(feature.id), { feature, state: "edited", original: feature });
                  return next;
                });
              } catch {}
            }
          },
        };
        (apiTmp as any).editSelectedFeatures();
      } catch {}
    },
    [zoneDetail]
  );

  // labels layer handling
  const applyLabelLayer = useCallback(() => {
    if (!isMapLoaded) return;
    const map = mapGLRef.current?.getMap?.() || mapGLRef.current;
    if (!map?.getSource?.("zones-tiles")) return;

    if (!map.getLayer("zones-labels")) {
      map.addLayer(
        {
          id: "zones-labels",
          type: "symbol",
          source: "zones-tiles",
          "source-layer": "zones",
          layout: {
            "text-field": "",
            "text-size": 12,
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "symbol-placement": "point",
            visibility: labelsVisible ? "visible" : "none",
          },
          paint: {
            "text-color": "#0f172a",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.2,
          },
        },
        "zones-line"
      );
    }
    updateLabelsField(labelField);
    updateLabelsVisibility(labelsVisible);
  }, [isMapLoaded]); // field/visible applied by helpers below

  function updateLabelsVisibility(v: boolean) {
    const map = mapGLRef.current?.getMap?.() || mapGLRef.current;
    try {
      map.setLayoutProperty(
        "zones-labels",
        "visibility",
        v ? "visible" : "none"
      );
    } catch {}
  }
  function updateLabelsField(f: "land_use_name" | "land_use" | "id" | "none") {
    const map = mapGLRef.current?.getMap?.() || mapGLRef.current;
    let textExpr: any = "";
    if (f === "land_use_name")
      textExpr = [
        "coalesce",
        ["get", "land_use_name"],
        ["to-string", ["get", "land_use"]],
        "",
      ];
    else if (f === "land_use") textExpr = ["to-string", ["get", "land_use"]];
    else if (f === "id") textExpr = ["to-string", ["id"]];
    else textExpr = "";
    try {
      map.setLayoutProperty("zones-labels", "text-field", textExpr);
    } catch {}
  }

  // styles registration
  useEffect(() => {
    if (!isMapLoaded || !landUses?.length) return;
    const mapRef = mapGLRef.current;
    const map = mapRef?.getMap ? mapRef.getMap() : mapRef;
    if (!map) return;
    const { solidColorByLU, patternByLU } = parseLandUseStyles(landUses, map);

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
      // Switch styling based on colorMode:
      // - type: use land use colors/patterns
      // - status: override color by status, no pattern
      const fillColor = colorMode === "status" ? statusColorExpr : baseColorExpr;
      const fillPattern = colorMode === "status" ? null : patternExpr;
      map.setPaintProperty("zones-fill", "fill-color", fillColor);
      map.setPaintProperty("zones-fill", "fill-opacity", 0.5);
      map.setPaintProperty("zones-fill", "fill-pattern", fillPattern);
    } catch {}

    // Conflicts GeoJSON source and layers (filled overlap + outline)
    try {
      if (!map.getSource("conflicts-src")) {
        map.addSource("conflicts-src", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        } as any);
      }
      if (!map.getLayer("conflicts-fill")) {
        map.addLayer(
          {
            id: "conflicts-fill",
            type: "fill",
            source: "conflicts-src",
            paint: { "fill-color": "#ef4444", "fill-opacity": 0.25 },
          },
          "zones-line"
        );
      }
      if (!map.getLayer("conflicts-line")) {
        map.addLayer(
          {
            id: "conflicts-line",
            type: "line",
            source: "conflicts-src",
            paint: { "line-color": "#ef4444", "line-width": 2 },
          },
          "conflicts-fill"
        );
      }
    } catch {}

    applyLabelLayer();
  }, [isMapLoaded, landUses, applyLabelLayer, colorMode]);

  // Add Points confirm → polygon
  const onConfirmAddPoints = useCallback(
    (rows: PointRow[], mode: CoordMode, epsg?: string) => {
      const valid = rows
        .filter((r) => r.order !== "" && r.a !== "" && r.b !== "")
        .sort((x, y) => Number(x.order) - Number(y.order));
      if (valid.length < 3) {
        toast.error("Please provide at least 3 valid points.");
        return;
      }

      const toLngLat = (r: PointRow): [number, number] | null => {
        if (mode === "wgs84") {
          const lat = Number(r.a),
            lon = Number(r.b);
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
          if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
          return [lon, lat];
        } else {
          if (!epsg || !/^EPSG:\d+$/.test(epsg.trim())) return null;
          const [lng, lat] = proj4(epsg.trim(), "EPSG:4326", [
            Number(r.a),
            Number(r.b),
          ]);
          if ([lng, lat].every((n) => Number.isFinite(n))) return [lng, lat];
          return null;
        }
      };

      const coords: [number, number][] = [];
      for (const r of valid) {
        const pt = toLngLat(r);
        if (!pt) {
          toast.error("Invalid coordinates or EPSG. Check your inputs.");
          return;
        }
        coords.push(pt);
      }
      const ring = closeRing(coords);
      const feature = {
        type: "Feature" as const,
        properties: {
          status: "Draft",
          locality: baseMapId ? Number(baseMapId) : undefined,
          land_use: defaultLandUseId ?? undefined,
        },
        geometry: { type: "Polygon" as const, coordinates: [ring] },
      };

      try {
        const draw = drawRef.current;
        const addedId = draw.add(feature as any)[0];
        const added = draw.get(addedId);
        setDrawStates((prev) => {
          const next = new Map(prev);
          next.set(String(addedId), {
            feature: added,
            state: "added",
            original: null,
          });
          return next;
        });
        setActiveZone(String(addedId));
        (draw as any).changeMode("direct_select", { featureId: addedId });
        toast.success("Polygon created from points");
        setPointsOpen(false);

        // update panel summary
        setActiveZoneInStore(
          String(addedId),
          {
            id: String(addedId),
            type: added?.properties?.land_use_name || "",
            status: added?.properties?.status || "Draft",
            color: added?.properties?.color || "#888",
            coordinates: getOuterRing(added?.geometry),
            notes: "",
          },
          true
        );
      } catch {
        toast.error("Failed to add polygon to map.");
      }
    },
    [baseMapId, defaultLandUseId, setActiveZoneInStore]
  );

  /* ------------------------------------ RENDER ------------------------------------ */
  // ResizeObserver: when container size changes (e.g., fullscreen), resize map and refresh counts
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timer: any;
    const RO = (window as any).ResizeObserver;
    if (!RO) return;
    const ro = new RO(() => {
      try {
        const map = mapGLRef.current?.getMap?.() || mapGLRef.current;
        map?.resize?.();
      } catch {}
      // debounce legend recompute a bit after resize
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          // recomputeLegendCounts is stable via useCallback deps
          (recomputeLegendCounts as any)();
        } catch {}
      }, 150);
    });
    ro?.observe?.(el);
    return () => {
      try { ro?.disconnect?.(); } catch {}
      clearTimeout(timer);
    };
  }, [recomputeLegendCounts]);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <MapGL
        ref={mapGLRef}
        onLoad={onMapLoad}
        onClick={onMapClick}
        onDblClick={onMapDoubleClick}
        initialViewState={{ longitude: 39.2, latitude: -6.36, zoom: 12 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAPBOX_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        transformRequest={transformRequest}
        maxZoom={20}
      >
        <NavigationControl position="top-left" />

        {/* Basemap (from locality) */}
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
              layout={{ visibility: basemapVisible ? "visible" : "none" }}
              paint={{ "fill-color": "#3b82f6", "fill-opacity": 0.3 }}
            />
            <Layer
              id="basemap-line"
              type="line"
              layout={{ visibility: basemapVisible ? "visible" : "none" }}
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

      {/* Add Points modal */}
      <AddPointsDialog
        open={pointsOpen}
        onOpenChange={setPointsOpen}
        onConfirm={onConfirmAddPoints}
      />
    </div>
  );
}

// Define UTM 37S once (used in status bar & AddPointsDialog)
proj4.defs(
  "EPSG:32737",
  "+proj=utm +zone=37 +south +datum=WGS84 +units=m +no_defs +type=crs"
);
