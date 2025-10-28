import useSubdivisionStore from "../store/useSubdivisionStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Map, Layers, Eye, Sparkles, X, Upload } from "lucide-react";
import { useSetZoneSubdivision } from '@/queries/useZoningQuery';
import { toast } from 'sonner';
// utils
import { useEffect, useState, useRef, useMemo } from 'react';
import { useLandUsesQuery } from '@/queries/useSetupQuery';

export default function SubdivisionLeftPanel() {
  const {
    styleName,
    setStyleName,
    
    plans,
    showPlans,
    showParcels,
    setShowPlans,
    setShowParcels,
    parcelOpacity,
    setParcelOpacity,
    boundaryGlow,
    setBoundaryGlow,
    colorMode,
    setLeftPanelOpen,
  selectAll,
  deselectAll,
    plansOpacity,
    setPlansOpacity,
    subdivisions,
    // Zone selection
    selectedZoneIds,
    selectZone,
    deselectZone,
    clearZoneSelection,
    setFeatureStateById,
  } = useSubdivisionStore();

  // plan selection count is available via store if needed
  const drawnParcelsCount = subdivisions?.length || 0;

  // fetch available land use types (to resolve ids -> names)
  const { data: landUses = [] } = useLandUsesQuery();
  const landUseMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const lu of landUses) {
      try { m[String(lu.id)] = lu.name; } catch { /* ignore */ }
    }
    return m;
  }, [landUses]);

  const resolveLandUseName = (z: any) => {
    if (!z) return '';
    const p = z.properties || {};
    // prefer explicit string names if present
    if (p.land_use_name) return String(p.land_use_name);
    if (p.land_use_type) return String(p.land_use_type);
    if (p.land_use_label) return String(p.land_use_label);

    // try numeric/string id lookups
    const id = p.land_use ?? p.land_use_id ?? p.landuse ?? p.lu ?? null;
    if (id != null) {
      const keyed = String(id);
      if (landUseMap[keyed]) return landUseMap[keyed];
      return keyed;
    }

    return '';
  };

  // land-use interactions moved to top menu

  // Local state: grouped zones per plan id
  const [planZones, setPlanZones] = useState<Record<string, any[]>>({});

    const loadPlanZones = () => {
      try {
        const api: any = useSubdivisionStore.getState().api;
        let feats: any[] = [];
        const m: any = useSubdivisionStore.getState().map;
        // Prefer source features (complete set, not just visible)
        if (m?.querySourceFeatures) {
          try { feats = m.querySourceFeatures('plans-tiles', { sourceLayer: 'zones' }) || []; } catch {}
        }
        // Fallback to API helper
        if (!feats?.length && api && typeof api.getPlans === 'function') {
          feats = api.getPlans() || [];
        }
        // Fallback to rendered features as last resort
        if (!feats?.length && m?.queryRenderedFeatures) {
          feats = m.queryRenderedFeatures({ layers: ['plans-fill'] }) || [];
        }

        const grouped: Record<string, any[]> = {};
        const mapping: Record<string, string | number> = {};

        const seen = new Set<string>();
        for (const f of feats) {
          // Prefer promoted id (properties.id) due to promoteId="id"
          const fid = f.properties?.id ?? f.id ?? null;
          // Build a stable key to dedupe across tiles; use fid when available
          const key = fid != null ? String(fid) : `${f.layer?.source || ''}:${f.layer?.sourceLayer || f.sourceLayer || ''}:${String(f.id)}`;

          if (seen.has(key)) continue;
          seen.add(key);

          // Try to infer a zone_snapshot id from multiple possible property names
          const snapshotId = f.properties?.zone_snapshot_id ?? f.properties?.zone_snapshot ?? f.properties?.snapshot_id ?? f.properties?.zone_id ?? f.properties?.id ?? f.id ?? null;
          if (fid != null && snapshotId != null) {
            mapping[String(fid)] = snapshotId;
          }

          const planId = String(f.properties?.plan_id ?? f.properties?.planId ?? f.properties?.plan ?? 'unknown');
          if (!grouped[planId]) grouped[planId] = [];
          // Ensure we carry correct sourceLayer for later feature-state updates
          if (!('sourceLayer' in f) && f?.layer) {
            (f as any).sourceLayer = f.layer?.sourceLayer || f.layer?.['source-layer'] || 'zones';
          }
          grouped[planId].push(f);
        }

        setPlanZones(grouped);
        setFeatureToSnapshot(mapping);
      } catch (err) {
        console.error('loadPlanZones', err);
        setPlanZones({});
      }
    };

    useEffect(() => {
      // Load zones when plans list changes (event-driven, no polling)
      loadPlanZones();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plans]);

    // keep selectedZoneIds in sync with plan selection (selectAll/deselectAll/togglePlan)
    // Keep a memory of previously selected plan IDs to know which plans were deselected
    const prevSelectedPlansRef = useRef<Set<string>>(new Set());
    useEffect(() => {
      try {
        const nowSelected = new Set<string>(plans.filter(p => p.selected).map(p => String(p.id)));
        const prevSelected = prevSelectedPlansRef.current;

        // Plans that just became selected: add their zones
        nowSelected.forEach((pid) => {
          if (!prevSelected.has(pid)) {
            const zones = planZones[pid] || [];
            zones.forEach((z: any) => {
              const fid = z.properties?.id ?? z.id;
              if (fid != null && !selectedZoneIds.has(String(fid))) selectZone(String(fid));
            });
          }
        });

        // Plans that were deselected: remove their zones
        prevSelected.forEach((pid) => {
          if (!nowSelected.has(pid)) {
            const zones = planZones[pid] || [];
            zones.forEach((z: any) => {
              const fid = z.properties?.id ?? z.id;
              if (fid != null && selectedZoneIds.has(String(fid))) deselectZone(String(fid));
            });
          }
        });

        // Update snapshot
        prevSelectedPlansRef.current = nowSelected;
      } catch (e) {
        console.error('sync selectedZoneIds', e);
      }
      // Update when plans or planZones change; rely on explicit per-zone handlers for individual checks
    }, [plans, planZones, selectedZoneIds, selectZone, deselectZone]);

  // map of rendered feature id -> snapshot id used for API
  const [featureToSnapshot, setFeatureToSnapshot] = useState<Record<string, string | number>>({});

    // Previously used for grouped UI; now we render a flat list so these helpers are unused

    // Button component: submits selected zones to API to mark can_be_subdivided
    function SubmitSelectedZonesButton() {
      const setSubdivision = useSetZoneSubdivision({ onDone: () => {} });
      const [loading, setLoading] = useState(false);

      const handleSubmit = async () => {
        const ids = Array.from(selectedZoneIds);
        if (!ids.length) {
          toast.error('No zones selected');
          return;
        }

        // Show confirmation for large selections
        if (ids.length > 10) {
          const confirmed = window.confirm(`Submit ${ids.length} zones for subdivision?`);
          if (!confirmed) return;
        }

        setLoading(true);
        try {
          // Submit all zones in parallel for speed (server can rate-limit if needed)
          const promises = ids.map(async (fid) => {
            try {
              // Lookup snapshot id from map
              const snapshotId = featureToSnapshot[String(fid)] ?? fid;
              // Use mutateAsync if available, otherwise wrap mutate in a Promise
              if (typeof setSubdivision.mutateAsync === 'function') {
                await setSubdivision.mutateAsync({ id: snapshotId, can_be_subdivided: true });
              } else {
                await new Promise((res, rej) => 
                  setSubdivision.mutate({ id: snapshotId, can_be_subdivided: true }, { onSuccess: res, onError: rej })
                );
              }

              // Mark zone as can_be_subdivided and clear its selected state
              setFeatureStateById(fid, { can_be_subdivided: true, selected: false });
            } catch (e) {
              console.error('Failed to submit zone:', fid, e);
              throw e;
            }
          });

          await Promise.all(promises);
          toast.success(`Updated ${ids.length} zones`);

          // Clear all zone selections in store (this also clears feature states)
          clearZoneSelection();
          // Clear plan-level selection in store
          deselectAll();
        } catch (err: any) {
          console.error('submit zones:', err);
          toast.error(err?.message || 'Failed to submit zones');
        } finally {
          setLoading(false);
        }
      };

      // Calculate indeterminate state for plans (some zones selected but not all)
      const indeterminatePlans = plans.filter(plan => {
        const pid = String(plan.id);
        const zones = planZones[pid] || [];
        const planZoneCount = zones.length;
        const selectedCount = zones
          .filter(z => {
            const zid = z?.properties?.id ?? z?.id;
            return zid != null && selectedZoneIds.has(String(zid));
          })
          .length;
        return selectedCount > 0 && selectedCount < planZoneCount;
      });

      return (
        <div className="flex items-center gap-2">
          {indeterminatePlans.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2">
              {indeterminatePlans.length} partial
            </Badge>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading || selectedZoneIds.size === 0}
            className="flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Submit {selectedZoneIds.size > 0 ? `(${selectedZoneIds.size})` : 'selected'}
          </Button>
        </div>
      );
    }

  return (
  <div className="overflow-auto flex flex-col bg-background border-r min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Subdivision</h2>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setLeftPanelOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Body */}
  <div className="flex flex-col flex-1 p-2 space-y-2 min-h-0">
        {/* Zones Section (renamed from Plans) */}
          <Card className="flex flex-col flex-shrink-0">
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Zones</CardTitle>
                {selectedZoneIds.size > 0 && (
                  <Badge variant="secondary" className="text-xs px-2">
                    {selectedZoneIds.size}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={selectAll} className="h-6 px-2 text-xs">
                  All
                </Button>
                <Button size="sm" variant="ghost" onClick={deselectAll} className="h-6 px-2 text-xs">
                  None
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-2 pt-0">
              <div className="pr-1 space-y-2">
                {/* Compact selected list */}
                {selectedZoneIds.size > 0 && (
                  <div className="px-2 py-1">
                    <div className="text-xs text-muted-foreground mb-1">Selected ({selectedZoneIds.size})</div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedZoneIds).slice(0, 6).map((fid) => (
                        <Badge key={fid} variant="secondary" className="text-xs">{fid}</Badge>
                      ))}
                      {selectedZoneIds.size > 6 && (
                        <Badge variant="outline" className="text-xs">+{selectedZoneIds.size - 6}</Badge>
                      )}
                    </div>
                    <div className="h-1" />
                  </div>
                )}
                {Object.keys(planZones).length ? (
                  (() => {
                    // Flatten all zones into a single list
                    const flat: any[] = Object.values(planZones).flat();
                    // Optional: sort by plan name then zone name for predictable order
                    flat.sort((a: any, b: any) => {
                      const pa = String(a.properties?.plan_name || a.properties?.planName || '');
                      const pb = String(b.properties?.plan_name || b.properties?.planName || '');
                      if (pa < pb) return -1;
                      if (pa > pb) return 1;
                      const na = String(a.properties?.name || a.properties?.zone_name || a.properties?.id || a.id || '');
                      const nb = String(b.properties?.name || b.properties?.zone_name || b.properties?.id || b.id || '');
                      return na.localeCompare(nb);
                    });

                    return flat.map((z: any) => {
                      const fid = z.properties?.id ?? z.id;
                      const fidStr = String(fid);
                      const planColor = z.properties?.plan_color || z.properties?.plan_color || z.properties?.color || '#666';
                      return (
                          <div key={fidStr} className="border-b last:border-b-0 px-2 py-1 flex items-center gap-2">
                          <Checkbox
                            className="w-4 h-4"
                            aria-label={`Select zone ${fidStr}`}
                            checked={selectedZoneIds.has(fidStr)}
                            onCheckedChange={(checked) => {
                              try {
                                if (checked) selectZone(fidStr); else deselectZone(fidStr);
                                setFeatureStateById(String(fid), { selected: !!checked });
                                try { useSubdivisionStore.getState().applySelectionToMap(); } catch {}
                              } catch (e) { console.error('toggle zone', e); }
                            }}
                          />
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: planColor }} />
                            <div className="flex-1 min-w-0 text-sm truncate">
                              <div className="truncate">{z.properties?.name || `Zone ${fidStr}`}</div>
                              <div className="text-xs text-muted-foreground">
                                {(() => {
                                  // show land use when in 'type' color mode, otherwise show status
                                  if (colorMode === 'type') {
                                    return resolveLandUseName(z) || '';
                                  }
                                  // status fallbacks
                                  return z.properties?.status || z.properties?.approvalStatus || z.properties?.approval_status || '';
                                })()}
                              </div>
                            </div>
                          <Badge variant="outline" className="text-xs px-1.5">
                            {z.properties?.can_be_subdivided ? 'Can' : '—'}
                          </Badge>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-2">No plans available</div>
                )}
              </div>

              {/* Submit selected zones */}
              <div className="flex items-center justify-end pt-2">
                <div className="flex items-center gap-2">
                  {selectedZoneIds.size > 0 && (
                    <Badge variant="secondary" className="text-xs px-2">{selectedZoneIds.size}</Badge>
                  )}
                  <SubmitSelectedZonesButton />
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Map Layers */}
        <Card className="flex-shrink-0">
          <CardHeader className="flex items-center gap-2 p-3 pb-1">
            <Eye className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Map Layers</CardTitle>
          </CardHeader>

          <CardContent className="p-3 pt-1 space-y-2">
            {/* Basemap control */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-foreground">Basemap</Label>
              <Select value={styleName} onValueChange={setStyleName}>
                <SelectTrigger className="h-8 text-sm w-40 relative z-50 pointer-events-auto bg-popover border border-border text-foreground">
                  <SelectValue placeholder="Select style" className="text-foreground" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streets-v12">Streets</SelectItem>
                  <SelectItem value="satellite-streets-v12">Satellite</SelectItem>
                  <SelectItem value="light-v10">Light</SelectItem>
                  <SelectItem value="dark-v10">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* land use types moved to top menu */}

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" /> Drawn Parcels
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {drawnParcelsCount}
                </Badge>
                <Switch checked={showParcels} onCheckedChange={setShowParcels} />
              </div>
            </div>

            {showParcels && (
              <div className="ml-4">
                <div className="flex items-center justify-between text-sm">
                  <Label className="text-xs text-muted-foreground">Opacity</Label>
                  <span className="text-xs">{Math.round(parcelOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={parcelOpacity}
                  onChange={(e) => setParcelOpacity(parseFloat(e.target.value))}
                  className="w-full h-1"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full" /> Plans
              </Label>
              <Switch checked={showPlans} onCheckedChange={setShowPlans} />
            </div>

            {showPlans && (
              <div className="ml-4">
                <div className="flex items-center justify-between text-sm">
                  <Label className="text-xs text-muted-foreground">Opacity</Label>
                  <span className="text-xs">{Math.round((plansOpacity || 0.45) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={plansOpacity || 0.45}
                  onChange={(e) => setPlansOpacity?.(parseFloat(e.target.value))}
                  className="w-full h-1"
                />
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Boundary Glow
              </Label>
              <Switch checked={boundaryGlow} onCheckedChange={setBoundaryGlow} />
            </div>
          </CardContent>
        </Card>

        {/* Labels removed per user request */}

        {/* Color Legend for Drawn Parcels */}
        {drawnParcelsCount > 0 && (
          <Card className="flex-shrink-0">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm font-semibold">Drawn Parcels Legend</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2563eb', opacity: 0.3 }} />
                <span>Fill (Blue)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-1 rounded" style={{ backgroundColor: '#2563eb' }} />
                <span>Boundary (Blue)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded border-2 border-green-500" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }} />
                <span>Selected (Green)</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
