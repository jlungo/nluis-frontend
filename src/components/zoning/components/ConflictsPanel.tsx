import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Scissors, Merge, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

interface Conflict {
  id: string;
  zones: string[];
  overlapArea: string;
  severity: 'Low' | 'Medium' | 'High';
}

interface Zone {
  id: string;
  type: string;
  color: string;
  status: string;
}

interface ConflictsPanelProps {
  conflicts: Conflict[];
  zones: Zone[];
}

export function ConflictsPanel({ conflicts, zones }: ConflictsPanelProps) {
  const getZoneInfo = (zoneId: string) => {
    return zones.find(z => z.id === zoneId);
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  const handleTrimZone = (conflictId: string, zoneId: string) => {
    toast.success(`Trimming zone ${zoneId} to resolve overlap`);
  };

  const handleSplitOverlap = (conflictId: string) => {
    toast.success('Splitting overlap area into separate zone');
  };

  const handleIgnoreConflict = (conflictId: string) => {
    toast.info('Conflict marked as ignored - zones kept as draft');
  };

  const handleViewConflict = (conflictId: string) => {
    toast.info('Zooming to conflict area on map');
  };

  if (conflicts.length === 0) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm">No conflicts detected</p>
          <p className="text-xs text-muted-foreground">
            All zones are properly separated with no overlapping areas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto max-h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3>Zone Conflicts</h3>
            <p className="text-sm text-muted-foreground">
              {conflicts.length} overlap{conflicts.length > 1 ? 's' : ''} detected
            </p>
          </div>
          <Badge variant="destructive">
            {conflicts.filter(c => c.severity === 'High').length} High
          </Badge>
        </div>

        <Separator />

        {/* Conflict List */}
        <div className="space-y-3">
          {conflicts.map((conflict) => {
            const zone1 = getZoneInfo(conflict.zones[0]);
            const zone2 = getZoneInfo(conflict.zones[1]);

            return (
              <Card key={conflict.id} className="border-destructive/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      Zone Overlap
                    </CardTitle>
                    <Badge variant={getSeverityBadgeVariant(conflict.severity)}>
                      {conflict.severity}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Conflicting Zones */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Conflicting Zones:</p>
                    <div className="space-y-2">
                      {[zone1, zone2].map((zone) => zone && (
                        <div key={zone.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: zone.color }}
                          />
                          <span className="text-sm">{zone.type}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {zone.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overlap Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Overlap Area:</p>
                      <p className="font-medium">{conflict.overlapArea}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Severity:</p>
                      <p className="font-medium">{conflict.severity}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Resolution Actions */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Resolution Options:</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTrimZone(conflict.id, conflict.zones[0])}
                      >
                        <Scissors className="w-4 h-4 mr-2" />
                        Trim {zone1?.type}
                      </Button>
                      <Button  type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTrimZone(conflict.id, conflict.zones[1])}
                      >
                        <Scissors className="w-4 h-4 mr-2" />
                        Trim {zone2?.type}
                      </Button>
                    </div>

                    <Button  type="button"
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleSplitOverlap(conflict.id)}
                    >
                      <Merge className="w-4 h-4 mr-2" />
                      Split Overlap
                    </Button>

                    <div className="flex gap-2">
                      <Button type="button"
                        variant="ghost" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewConflict(conflict.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View on Map
                      </Button>
                      <Button  type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleIgnoreConflict(conflict.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Ignore
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help Text */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Conflict Resolution Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Trim Zone:</strong> Automatically removes overlap from selected zone</li>
                <li>• <strong>Split Overlap:</strong> Creates new zone from overlapping area</li>
                <li>• <strong>Ignore:</strong> Keeps zones as drafts for manual review</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}