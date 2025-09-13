import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const zoneTypes = [
  { 
    type: 'Agricultural', 
    color: '#22c55e', 
    count: 8,
    description: 'Crop cultivation and farming areas'
  },
  { 
    type: 'Residential', 
    color: '#3b82f6', 
    count: 12,
    description: 'Housing and living areas'
  },
  { 
    type: 'Commercial', 
    color: '#f59e0b', 
    count: 6,
    description: 'Business and retail zones'
  },
  { 
    type: 'Industrial', 
    color: '#ef4444', 
    count: 3,
    description: 'Manufacturing and industry'
  },
  { 
    type: 'Conservation', 
    color: '#10b981', 
    count: 4,
    description: 'Protected environmental areas'
  },
  { 
    type: 'Recreational', 
    color: '#8b5cf6', 
    count: 2,
    description: 'Parks and leisure facilities'
  }
];

const statusTypes = [
  { status: 'Approved', color: '#22c55e', opacity: 1.0 },
  { status: 'In Review', color: '#f59e0b', opacity: 0.7 },
  { status: 'Draft', color: '#6b7280', opacity: 0.5 },
  { status: 'Rejected', color: '#dc2626', opacity: 0.6 },
  { status: 'Conflict', color: '#ef4444', opacity: 0.8 }
];

interface ZoneLegendProps {
  colorMode?: 'type' | 'status';
}

export function ZoneLegend({ colorMode = 'type' }: ZoneLegendProps) {
  return (
    <div className="space-y-4">
      {/* Zone Types or Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            {colorMode === 'type' ? 'Zone Types' : 'Zone Status'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {colorMode === 'type' ? (
            zoneTypes.map((zone) => (
              <div key={zone.type} className="flex items-center justify-between group">
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: zone.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{zone.type}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {zone.description}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs ml-2">
                  {zone.count}
                </Badge>
              </div>
            ))
          ) : (
            statusTypes.map((status) => (
              <div key={status.status} className="flex items-center justify-between group">
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-4 h-4 rounded flex-shrink-0 relative"
                    style={{ backgroundColor: status.color, opacity: status.opacity }}
                  >
                    {status.status === 'Conflict' && (
                      <div 
                        className="absolute inset-0 bg-red-500 opacity-30"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,0.3) 1px, rgba(255,255,255,0.3) 2px)'
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{status.status}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs ml-2">
                  {status.status === 'Approved' ? '8' : 
                   status.status === 'Draft' ? '4' :
                   status.status === 'In Review' ? '2' : 
                   status.status === 'Rejected' ? '1' : '1'}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Zone Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {statusTypes.map((status) => (
            <div key={status.status} className="flex items-center gap-2">
              <div className="relative w-4 h-4 flex-shrink-0">
                <div 
                  className="w-full h-full rounded border"
                  style={{ 
                    backgroundColor: status.color,
                    opacity: status.opacity
                  }}
                />
                {status.status === 'Conflict' && (
                  <div 
                    className="absolute inset-0 bg-red-500 opacity-30"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)'
                    }}
                  />
                )}
              </div>
              <span className="text-sm">{status.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Legend Notes */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Zones with conflicts show red hatching pattern</p>
        <p>• Draft zones appear semi-transparent</p>
        <p>• Click zones to view details in right panel</p>
      </div>
    </div>
  );
}