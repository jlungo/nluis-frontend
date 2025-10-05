import useSubdivisionStore from "../store/useSubdivisionStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Map, Layers, Eye, Tag, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubdivisionLeftPanel() {
  const {
    styleName,
    setStyleName,
    labelsVisible,
    toggleLabels,
    plans,
    showPlans,
    showParcels,
    setShowPlans,
    setShowParcels,
    parcelOpacity,
    setParcelOpacity,
    boundaryGlow,
    setBoundaryGlow,
    setLeftPanelOpen,
    selectAll,
    deselectAll,
    togglePlan,
  } = useSubdivisionStore();

  const selectedCount = plans.filter((z) => z.selected).length;

  const handlePlanToggle = (id: string | number) => {
    togglePlan(id);
    const m = useSubdivisionStore.getState().map;
    if (!m) return;
    try {
      m.setFeatureState({ source: "plans-tiles", sourceLayer: "plans", id: Number(id) || id }, { selected: true });
    } catch {}
  };

  return (
    <div className="h-full flex flex-col bg-background border-r">
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
      <div className="flex flex-col flex-1 p-2 space-y-2 overflow-hidden">
        {/* Plans Section */}
        <Card className="flex flex-col flex-shrink-0">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Plans</CardTitle>
              {selectedCount > 0 && (
                <Badge variant="secondary" className="text-xs px-2">
                  {selectedCount}
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
            <div className="max-h-[200px] overflow-y-auto pr-1 space-y-1">
              {plans.length ? (
                plans.map((z) => (
                  <div
                    key={z.id}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded cursor-pointer border transition",
                      z.selected ? "bg-primary/10 border-primary/20" : "hover:bg-muted/50"
                    )}
                    onClick={() => handlePlanToggle(z.id)}
                  >
                    <Checkbox checked={!!z.selected} onCheckedChange={() => handlePlanToggle(z.id)} />
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: z.color }} />
                    <span className="flex-1 truncate text-sm">{z.name}</span>
                    <Badge variant="outline" className="text-xs px-1.5">
                      {(z as any).count || 0}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-2">No plans available</div>
              )}
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
            <div>
              <Label className="text-sm">Basemap</Label>
              <Select value={styleName} onValueChange={setStyleName}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streets-v12">Streets</SelectItem>
                  <SelectItem value="satellite-streets-v12">Satellite</SelectItem>
                  <SelectItem value="light-v10">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" /> Parcels
              </Label>
              <Switch checked={showParcels} onCheckedChange={setShowParcels} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full" /> Plans
              </Label>
              <Switch checked={showPlans} onCheckedChange={setShowPlans} />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between text-sm">
                <Label>Opacity</Label>
                <span className="text-xs">{Math.round(parcelOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={parcelOpacity}
                onChange={(e) => setParcelOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Glow
              </Label>
              <Switch checked={boundaryGlow} onCheckedChange={setBoundaryGlow} />
            </div>
          </CardContent>
        </Card>

        {/* Labels — one line */}
        <Card className="flex items-center justify-between px-3 py-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Labels</span>
          </div>
          <Switch checked={labelsVisible} onCheckedChange={toggleLabels} />
        </Card>
      </div>
    </div>
  );
}
