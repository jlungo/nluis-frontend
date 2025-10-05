import React from 'react';
import useSubdivisionStore from '../store/useSubdivisionStore';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { 
  X, FileText, AlertTriangle, History, MapPin, Save, RotateCcw, Info, Globe
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function RightDock() {
  const [tab, setTab] = React.useState<'sub' | 'geo' | 'cs'>('sub');

  const inspectorOpen = useSubdivisionStore((s) => s.inspectorOpen);
  const selectedId = useSubdivisionStore((s) => s.selectedId);
  const subdivisions = useSubdivisionStore((s) => s.subdivisions);
  const updateSubdivision = useSubdivisionStore((s) => s.updateSubdivision);
  const setRightPanelOpen = useSubdivisionStore((s) => s.setRightPanelOpen);

  const selected = subdivisions.find(
    (s) => s.properties?.id === selectedId || (s.properties as any)?._drawId === selectedId
  ) || null;

  const [draft, setDraft] = React.useState<any>(null);
  const [hasChanges, setHasChanges] = React.useState(false);

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
          <TabsContent value="geo" className="space-y-4 mt-0">
            <Card className="border-2 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Subdivision Conflicts</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Shows detected conflicts for this subdivision
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selected?.properties?.conflicts?.length ? (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selected.properties.conflicts.map((c: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border rounded-md p-2 text-xs bg-muted/40 hover:bg-muted/60 transition"
                      >
                        <span className="truncate">{c.description || 'Unnamed conflict'}</span>
                        <Badge variant="destructive">{c.type || 'Conflict'}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      No conflicts found for this subdivision.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coordinate System Tab */}
          <TabsContent value="cs" className="space-y-4 mt-0">
            <Card className="border-2 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Coordinate Systems</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Configure coordinate preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition">
                  <Label htmlFor="wgs84-switch" className="text-sm font-medium cursor-pointer">
                    WGS84 (Lat/Long)
                  </Label>
                  <Switch id="wgs84-switch" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition">
                  <Label htmlFor="utm-switch" className="text-sm font-medium cursor-pointer">
                    UTM Coordinates
                  </Label>
                  <Switch id="utm-switch" />
                </div>
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-900">
                    Coordinate systems can be changed anytime. Data converts automatically.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
