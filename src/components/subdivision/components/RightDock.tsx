import React from 'react';
import useSubdivisionStore from '../store/useSubdivisionStore';
import { ConflictsPanel } from '@/components/zoning/components/ConflictsPanel';
import { HistoryPanel } from '@/components/zoning/components/HistoryPanel';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
// ...existing code...
import { Alert, AlertDescription } from '@/components/ui/alert';

import { 
  X, FileText, AlertTriangle, History, MapPin, Save, RotateCcw, Info,
  Layers
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { type PlanSummary } from '../store/types';
import { Checkbox } from '@/components/ui/checkbox';

export default function RightDock() {
  const [tab, setTab] = React.useState<'sub' | 'geo' | 'cs'>('sub');

  const inspectorOpen = useSubdivisionStore((s) => s.inspectorOpen);
  const selectedId = useSubdivisionStore((s) => s.selectedId);
  const subdivisions = useSubdivisionStore((s) => s.subdivisions);
  const updateSubdivision = useSubdivisionStore((s) => s.updateSubdivision);
  const setRightPanelOpen = useSubdivisionStore((s) => s.setRightPanelOpen);
  const selectedZoneIds = useSubdivisionStore((s) => s.selectedZoneIds);
  const plans = useSubdivisionStore((s) => s.plans);

  // Local state for zone grouping
  const [planZones, setPlanZones] = React.useState<Record<string, any[]>>({});

  // Load zones when plans change (event-driven, no polling)
  React.useEffect(() => {
    const loadZones = () => {
      try {
        const api = useSubdivisionStore.getState().api;
        let feats: any[] = [];
        if (api?.getPlans) {
          feats = api.getPlans();
        } else {
          const map = useSubdivisionStore.getState().map;
          if (map?.queryRenderedFeatures) {
            feats = map.queryRenderedFeatures({ layers: ['plans-fill'] }) || [];
          }
        }

        const grouped: Record<string, any[]> = {};
        feats.forEach((f) => {
          const planId = String(f.properties?.plan_id ?? f.properties?.planId ?? f.properties?.plan ?? 'unknown');
          if (!grouped[planId]) grouped[planId] = [];
          grouped[planId].push(f);
        });

        setPlanZones(grouped);
      } catch (err) {
        console.error('loadZones error:', err);
      }
    };

    loadZones();
  }, [plans]);

  const selected = subdivisions.find(
    (s) => s.properties?.id === selectedId || (s.properties as any)?._drawId === selectedId
  ) || null;

  const [draft, setDraft] = React.useState<any>(null);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Attempt to derive plan info from the selected feature properties
  const planId = (selected as any)?.properties?.plan_id || (selected as any)?.properties?.planId || null;
  const planName = (selected as any)?.properties?.plan_name || (selected as any)?.properties?.planName || null;

  // If a locality context is present elsewhere you can wire usePlansQuery/usePlanDetailQuery here.
  // For now we prefer lightweight local display using feature properties to avoid unnecessary requests.
  // const plansQuery = usePlansQuery(localityId ? { locality: localityId } : null as any);
  // const { data: planDetail } = usePlanDetailQuery(planId ?? undefined as any);

  React.useEffect(() => {
    const initialDraft = selected ? { ...(selected.properties as any) } : null;
    setDraft(initialDraft);
    setHasChanges(false);
  }, [selectedId, selected]);

  const handleDraftChange = (field: string, value: any) => {
    setDraft((d: any) => ({ ...d, [field]: value }));
    setHasChanges(true);
  };

  const saveDraft = () => {
    if (!selected || !draft) return;
    updateSubdivision(
      (selected.properties as any).id || (selected.properties as any)._drawId,
      draft as any
    );
    setHasChanges(false);
    toast.success('Subdivision updated successfully');
  };

  const revertChanges = () => {
    setDraft(selected ? { ...(selected.properties as any) } : null);
    setHasChanges(false);
    toast.info('Changes reverted');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Subdivision</h2>
          {selectedId && (
            <Badge variant="secondary" className="ml-2">
              {selectedId}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setRightPanelOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable main content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="sub" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="geo" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Conflicts</span>
            </TabsTrigger>
            <TabsTrigger value="cs" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="sub" className="space-y-4 mt-0">
            <Card className="border-2 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Subdivision Details</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Manage parcel information, parties, and allocations
                </CardDescription>
              </CardHeader>
              <CardContent>
                  {inspectorOpen && selected ? (
                  <div className="space-y-4">
                    {/* Plan metadata if present on the selected feature */}
                    {(planId || planName) && (
                      <Card className="mb-2 border">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm">Plan Info</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                          {planName && <div><strong>Name:</strong> {planName}</div>}
                          {planId && <div><strong>ID:</strong> {planId}</div>}
                        </CardContent>
                      </Card>
                    )}
                    {/* Info */}
                    <Alert className="border-primary/20 bg-primary/5">
                      <Info className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-sm">
                        Editing subdivision: <strong>{(selected.properties as any)?.id || 'New'}</strong>
                      </AlertDescription>
                    </Alert>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        Title
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter subdivision title"
                        value={draft?.title || ''}
                        onChange={(e) => handleDraftChange('title', e.target.value)}
                        className={cn(hasChanges && 'border-primary')}
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes or description"
                        value={draft?.notes || ''}
                        onChange={(e) => handleDraftChange('notes', e.target.value)}
                        rows={3}
                        className={cn(hasChanges && 'border-primary')}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveDraft}
                        disabled={!hasChanges}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={revertChanges}
                        disabled={!hasChanges}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Revert
                      </Button>
                    </div>

                    <Separator />

                    {/* Listed Zones */}
                    <Card className="border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm">Zones</CardTitle>
                          </div>
                          {selectedZoneIds.size > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedZoneIds.size} selected
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-[200px] overflow-y-auto space-y-2">
                          {plans.map((plan: PlanSummary) => {
                            const zones = (planZones[String(plan.id)] || []).filter((z: any) => {
                              // Only show zones that can be subdivided or are selected
                              const fid = z.id ?? z.properties?.id;
                              return selectedZoneIds.has(String(fid)) || z.properties?.can_be_subdivided;
                            });
                            if (!zones.length) return null;
                            return (
                              <div key={plan.id} className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color || '#666' }} />
                                  {plan.name}
                                </div>
                                <div className="pl-4 space-y-1">
                                  {zones.map((z: any) => {
                                    const fid = z.id ?? z.properties?.id;
                                    const fidStr = String(fid);
                                    const isSelected = selectedZoneIds.has(fidStr);
                                    const canBeSubdivided = z.properties?.can_be_subdivided;
                                    return (
                                      <div key={fid} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <Checkbox
                                            className="w-4 h-4"
                                            aria-label={`Select zone ${fidStr}`}
                                            checked={isSelected}
                                            onCheckedChange={(checked) => {
                                              if (checked) useSubdivisionStore.getState().selectZone(fidStr); else useSubdivisionStore.getState().deselectZone(fidStr);
                                              useSubdivisionStore.getState().setFeatureStateById(String(fid), { selected: !!checked });
                                              try { useSubdivisionStore.getState().applySelectionToMap(); } catch {}
                                            }}
                                          />
                                          <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: z.properties?.color || z.properties?.fill || '#6b7280' }} />
                                          <span className="truncate">{z.properties?.name || `Zone ${fid}`}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {isSelected && (
                                            <Badge variant="default" className="text-[10px] px-1.5">Selected</Badge>
                                          )}
                                          {canBeSubdivided && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 border-green-500 text-green-500">
                                              Can subdivide
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                          {!plans.some(p => (planZones[String(p.id)] || []).length > 0) && (
                            <div className="text-sm text-muted-foreground text-center py-4">
                              No zones available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Coordinates */}
                    {(selected.properties as any)?.centroid && (
                      <Card className="border bg-muted/30">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm">Coordinates</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between p-2 rounded bg-background">
                            <span className="text-muted-foreground">WGS84:</span>
                            <span className="font-medium">
                              {(selected.properties as any).centroid.lng.toFixed(6)}, {(selected.properties as any).centroid.lat.toFixed(6)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {!inspectorOpen 
                        ? 'Inspector is closed. Open inspector to view details.' 
                        : 'No subdivision selected. Select a subdivision to view details.'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conflicts Tab */}
          <TabsContent value="geo" className="p-0">
            {/* Use the shared ConflictsPanel component. Convert selected.properties.conflicts into the expected shape. */}
            <ConflictsPanel
              conflicts={(selected?.properties?.conflicts || []).map((c: any, idx: number) => ({
                id: c.id || String(idx),
                zones: c.zones || (c.zoneIds ? c.zoneIds : []),
                overlapArea: c.overlapArea || c.area || 'n/a',
                severity: c.severity || 'Low',
              }))}
              zones={[]}
            />
          </TabsContent>

          {/* Coordinate System Tab */}
          <TabsContent value="cs" className="p-0">
            {/* Reuse the HistoryPanel for rollout/history info. Pass a minimal zones list and selected zone id if available. */}
            <HistoryPanel
              zones={(selected ? [{ id: (selected.properties as any)?.id || (selected.properties as any)?._drawId || 'unknown', type: 'Subdivision', status: 'Active' }] : []) as any}
              activeZone={selected ? ((selected.properties as any)?.id || (selected.properties as any)?._drawId) : undefined}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
