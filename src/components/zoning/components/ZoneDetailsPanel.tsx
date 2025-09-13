import React, { useState } from 'react';
import { Save, Edit, Trash2, MapPin, CheckCircle, AlertTriangle, Info, Scissors, Move3D, RotateCw, Download, Upload, ThumbsUp, ThumbsDown, FileDown, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const zoneTypes = [
  { value: 'agricultural', label: 'Agricultural', color: '#22c55e' },
  { value: 'residential', label: 'Residential', color: '#3b82f6' },
  { value: 'commercial', label: 'Commercial', color: '#f59e0b' },
  { value: 'industrial', label: 'Industrial', color: '#ef4444' },
  { value: 'conservation', label: 'Conservation', color: '#10b981' },
  { value: 'recreational', label: 'Recreational', color: '#8b5cf6' }
];

interface Zone {
  id: string;
  type: string;
  color: string;
  coordinates: number[][];
  status: string;
  attributes: Record<string, string>;
  notes: string;
  lastModified: string;
}

interface ZoneDetailsPanelProps {
  activeZone: string | null;
  zones: Zone[];
  onUpdateZone: (zones: Zone[]) => void;
  conflicts?: Array<{id: string; zones: string[]; overlapArea: string; severity: string;}>;
}

const defaultConflicts: Array<{id: string; zones: string[]; overlapArea: string; severity: string;}> = [];

export function ZoneDetailsPanel({ activeZone, zones, onUpdateZone, conflicts = defaultConflicts }: ZoneDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const zone = zones.find(z => z.id === activeZone);

  const [editForm, setEditForm] = useState({
    name: zone?.attributes?.name || zone?.type || '',
    type: zone?.type || '',
    color: zone?.color || '',
    notes: zone?.notes || '',
    attributes: zone?.attributes || {}
  });

  React.useEffect(() => {
    if (zone) {
      setEditForm({
        name: zone.attributes?.name || zone.type,
        type: zone.type,
        color: zone.color,
        notes: zone.notes,
        attributes: zone.attributes
      });
    }
  }, [zone]);

  const handleSave = () => {
    if (!zone) return;

    const updatedZones = zones.map(z => 
      z.id === zone.id 
        ? { ...z, ...editForm, lastModified: new Date().toISOString().split('T')[0] }
        : z
    );

    onUpdateZone(updatedZones);
    setIsEditing(false);
    toast.success('Zone updated successfully');
  };

  const handleDelete = () => {
    if (!zone) return;
    
    const updatedZones = zones.filter(z => z.id !== zone.id);
    onUpdateZone(updatedZones);
    toast.success('Zone deleted successfully');
  };

  const handleApprove = () => {
    if (!zone) return;
    
    const updatedZones = zones.map(z => 
      z.id === zone.id ? { ...z, status: 'Approved' } : z
    );
    onUpdateZone(updatedZones);
    toast.success(`Zone ${zone.id} approved successfully`);
  };

  const handleReject = () => {
    if (!zone) return;
    
    const updatedZones = zones.map(z => 
      z.id === zone.id ? { ...z, status: 'Rejected' } : z
    );
    onUpdateZone(updatedZones);
    toast.error(`Zone ${zone.id} rejected`);
  };

  const handleDownloadZone = () => {
    if (!zone) return;
    
    // Simulate downloading zone for QGIS editing
    const zoneData = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {
          zone_id: zone.id,
          zone_type: zone.type,
          status: zone.status,
          color: zone.color,
          notes: zone.notes,
          ...zone.attributes
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] // Mock coordinates
        }
      }]
    };
    
    const blob = new Blob([JSON.stringify(zoneData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zone_${zone.id}_for_qgis.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Zone ${zone.id} downloaded for QGIS editing`);
  };

  const handleImportZone = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.geojson,.json,.gpkg,.zip';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast.success(`Importing updated zone from ${file.name}...`);
        // Here you would process the file and update the zone
        setTimeout(() => {
          toast.success(`Zone ${zone.id} updated from QGIS successfully`);
        }, 1500);
      }
    };
    input.click();
  };

  const handleTypeChange = (newType: string) => {
    const zoneType = zoneTypes.find(t => t.value === newType);
    setEditForm(prev => ({
      ...prev,
      type: zoneType?.label || newType,
      color: zoneType?.color || prev.color
    }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'In Review': return 'secondary';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };

  if (!activeZone || !zone) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Select a zone to view details</p>
          <p className="text-sm text-muted-foreground">
            Click on a zone in the map or use the drawing tools to create new zones
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 h-full overflow-y-auto max-h-full">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base">Zone Details</h3>
            <p className="text-xs text-muted-foreground">Zone ID: {zone.id}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(zone.status)} className="text-xs">
            {zone.status}
          </Badge>
        </div>

        <Separator />

        {/* Zone Properties in Custom Attributes Style */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Zone Properties</Label>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newKey = `attribute_${Date.now()}`;
                  setEditForm(prev => ({
                    ...prev,
                    attributes: { ...prev.attributes, [newKey]: '' }
                  }));
                }}
                className="h-6 text-xs"
              >
                Add Attribute
              </Button>
            )}
          </div>
          
          <div className="space-y-1 text-sm">
            {/* Zone Name */}
            <div className="grid grid-cols-5 gap-2">
              {isEditing ? (
                <>
                  <span className="text-muted-foreground col-span-2 text-xs">Name:</span>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3 h-6 text-xs"
                    placeholder="Enter zone name..."
                  />
                </>
              ) : (
                <>
                  <span className="text-muted-foreground capitalize col-span-2 text-xs">Name:</span>
                  <span className="col-span-3 text-xs">{zone.attributes?.name || zone.type}</span>
                </>
              )}
            </div>

            {/* Zone Type */}
            <div className="grid grid-cols-5 gap-2">
              {isEditing ? (
                <>
                  <span className="text-muted-foreground col-span-2 text-xs">Type:</span>
                  <Select value={editForm.type.toLowerCase()} onValueChange={handleTypeChange}>
                    <SelectTrigger className="col-span-3 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {zoneTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded"
                              style={{ backgroundColor: type.color }}
                            />
                            <span className="text-xs">{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground capitalize col-span-2 text-xs">Type:</span>
                  <div className="col-span-3 flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: zone.color }}
                    />
                    <span className="text-xs">{zone.type}</span>
                  </div>
                </>
              )}
            </div>

            {/* Status */}
            <div className="grid grid-cols-5 gap-2">
              <span className="text-muted-foreground capitalize col-span-2 text-xs">Status:</span>
              <span className="col-span-3 text-xs">{zone.status}</span>
            </div>

            {/* Last Modified */}
            <div className="grid grid-cols-5 gap-2">
              <span className="text-muted-foreground capitalize col-span-2 text-xs">Modified:</span>
              <span className="col-span-3 text-xs">{zone.lastModified}</span>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-5 gap-2">
              <span className="text-muted-foreground capitalize col-span-2 text-xs">Points:</span>
              <span className="col-span-3 text-xs">{zone.coordinates.length} coordinates</span>
            </div>

            {/* Custom Attributes */}
            {Object.entries(editForm.attributes).map(([key, value]) => (
              <div key={key} className="grid grid-cols-5 gap-2">
                {isEditing ? (
                  <>
                    <Input
                      value={key}
                      onChange={(e) => {
                        const newAttributes = { ...editForm.attributes };
                        delete newAttributes[key];
                        newAttributes[e.target.value] = value;
                        setEditForm(prev => ({ ...prev, attributes: newAttributes }));
                      }}
                      className="col-span-2 h-6 text-xs"
                      placeholder="Key"
                    />
                    <Input
                      value={value}
                      onChange={(e) => {
                        setEditForm(prev => ({
                          ...prev,
                          attributes: { ...prev.attributes, [key]: e.target.value }
                        }));
                      }}
                      className="col-span-2 h-6 text-xs"
                      placeholder="Value"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newAttributes = { ...editForm.attributes };
                        delete newAttributes[key];
                        setEditForm(prev => ({ ...prev, attributes: newAttributes }));
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-2 h-2" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground capitalize col-span-2 text-xs">{key}:</span>
                    <span className="col-span-3 text-xs">{value}</span>
                  </>
                )}
              </div>
            ))}

            {/* Color (only in edit mode) */}
            {isEditing && (
              <div className="grid grid-cols-5 gap-2">
                <span className="text-muted-foreground col-span-2 text-xs">Color:</span>
                <div className="col-span-3 flex items-center gap-1">
                  <Input
                    type="color"
                    value={editForm.color}
                    onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-6 h-6 p-0 border-0"
                  />
                  <Input
                    value={editForm.color}
                    onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 h-6 text-xs"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm">Notes</Label>
          {isEditing ? (
            <Textarea
              value={editForm.notes}
              onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes about this zone..."
              rows={3}
              className="text-xs"
            />
          ) : (
            <div className="p-2 border rounded bg-background min-h-[60px]">
              <p className="text-xs">{zone.notes || 'No notes available'}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Validation Status */}
        <div className="space-y-2">
          <Label className="text-sm">Validation Status</Label>
          <div className="grid grid-cols-2 gap-1">
            <Badge variant="default" className="justify-center text-xs py-1">
              <CheckCircle className="w-2 h-2 mr-1" />
              Valid
            </Badge>
            <Badge variant="default" className="justify-center text-xs py-1">
              <CheckCircle className="w-2 h-2 mr-1" />
              Inside Boundary
            </Badge>
            <Badge variant={conflicts.some(c => c.zones.includes(zone.id)) ? "destructive" : "outline"} className="justify-center text-xs py-1">
              <AlertTriangle className="w-2 h-2 mr-1" />
              Overlaps: {conflicts.filter(c => c.zones.includes(zone.id)).length}
            </Badge>
            <Badge variant="outline" className="justify-center text-xs py-1">
              <Info className="w-2 h-2 mr-1" />
              No Self-intersect
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Geometry Tools */}
        <div className="space-y-2">
          <Label className="text-sm">Geometry Tools</Label>
          <div className="grid grid-cols-2 gap-1">
            <Button variant="outline" size="sm" onClick={() => toast.info('Clipping to locality boundary')} className="text-xs py-1">
              <Scissors className="w-3 h-3 mr-1" />
              Clip
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info('Simplifying geometry')} className="text-xs py-1">
              <Move3D className="w-3 h-3 mr-1" />
              Simplify
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info('Buffering geometry')} className="text-xs py-1">
              <RotateCw className="w-3 h-3 mr-1" />
              Buffer
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info('Fixing geometry')} className="text-xs py-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              Fix
            </Button>
          </div>
        </div>

        <Separator />

        {/* QGIS Workflow */}
        <div className="space-y-2">
          <Label className="text-sm">QGIS Workflow</Label>
          <div className="grid grid-cols-2 gap-1">
            <Button variant="outline" size="sm" onClick={handleDownloadZone} className="text-xs py-1">
              <FileDown className="w-3 h-3 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportZone} className="text-xs py-1">
              <FileUp className="w-3 h-3 mr-1" />
              Import
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Download zone for QGIS editing, then import updated geometry.
          </p>
        </div>

        <Separator />

        {/* Zone Status Actions */}
        <div className="space-y-2">
          <Label className="text-sm">Actions</Label>
          
          {zone.status !== 'Approved' && zone.status !== 'Rejected' && (
            <div className="grid grid-cols-2 gap-1">
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-xs py-1"
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                Approve
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleReject}
                className="text-xs py-1"
              >
                <ThumbsDown className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </div>
          )}
          
          {zone.status === 'Approved' && (
            <p className="text-xs text-muted-foreground">
              ✅ Zone is approved and production-ready
            </p>
          )}
          
          {zone.status === 'Rejected' && (
            <div className="space-y-1">
              <p className="text-xs text-destructive">
                ❌ Zone has been rejected
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const updatedZones = zones.map(z => 
                    z.id === zone.id ? { ...z, status: 'Draft' } : z
                  );
                  onUpdateZone(updatedZones);
                  toast.info(`Zone ${zone.id} moved back to Draft status`);
                }}
                className="w-full text-xs py-1"
              >
                <RotateCw className="w-3 h-3 mr-1" />
                Revert to Draft
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-1 pt-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="flex-1 text-xs py-1">
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="text-xs py-1">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)} className="flex-1 text-xs py-1">
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="text-xs py-1 px-2">
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}