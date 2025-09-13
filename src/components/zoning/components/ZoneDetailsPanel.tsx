// src/components/zoning/ZoneDetailsPanel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Save, Edit, Trash2, MapPin, CheckCircle, AlertTriangle,
  ThumbsUp, ThumbsDown
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLandUsesQuery, LandUseDto } from "@/queries/useSetupQuery";

export interface Zone {
  id: string | number;
  type: string;
  color: string;
  coordinates: number[][];
  status: string;
  attributes: Record<string, string>;
  notes: string;
  lastModified?: string;
}

interface ZoneDetailsPanelProps {
  activeZone: string | null;
  zones: Zone[];
  onUpdateZone: (zones: Zone[]) => void;
  conflicts?: Array<{ id: string; zones: (string | number)[]; overlapArea: string; severity: string }>;
  landUses?: LandUseDto[];
  onAssignLandUse?: (zoneId: string | number, landUse: LandUseDto) => void;
  isNewZone?: boolean;
}

const defaultConflicts: ZoneDetailsPanelProps["conflicts"] = [];

export function ZoneDetailsPanel({
  activeZone,
  zones,
  onUpdateZone,
  conflicts = defaultConflicts,
  landUses = [],
  onAssignLandUse,
  isNewZone = false,
}: ZoneDetailsPanelProps) {
  const zone = useMemo(
    () => zones.find((z) => String(z.id) === String(activeZone)),
    [zones, activeZone]
  );

  // Fallback fetch if parent didn't pass
  const { data: fetchedLUs = [], isLoading: luLoading } = useLandUsesQuery();
  const availableLUs = (landUses?.length ? landUses : fetchedLUs) ?? [];

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!zone) return;
    const clientId = Number.isNaN(Number(zone.id)); // string => unsaved
    setIsEditing(isNewZone || clientId);
  }, [zone, isNewZone]);

  // --- form state ---
  type EditForm = {
    name: string;
    type: string;
    color: string;
    notes: string;
    attributes: Record<string, string>;
    landUseId: number | string | undefined;
  };

  const [editForm, setEditForm] = useState<EditForm>({
    name: zone?.attributes?.name || zone?.type || "",
    type: zone?.type || "",
    color: zone?.color || "",
    notes: zone?.notes || "",
    attributes: zone?.attributes || {},
    landUseId: undefined,
  });

  // Re-init only when switching to a different zone id (prevents wiping user selection)
  const zoneKey = String(zone?.id ?? "");
  const prevZoneKey = useRef<string>(zoneKey);

  useEffect(() => {
    if (!zone) return;

    const switchingZones = prevZoneKey.current !== zoneKey;
    if (!switchingZones) return;
    prevZoneKey.current = zoneKey;

    const match = availableLUs.find(
      (lu) => lu.name.toLowerCase() === (zone.type || "").toLowerCase()
    );

    setEditForm({
      name: zone.attributes?.name || zone.type || "",
      type: zone.type,
      color: match?.color || zone.color || "#888",
      notes: zone.notes || "",
      attributes: zone.attributes || {},
      landUseId: match?.id,
    });
  }, [zoneKey, zone, availableLUs]);

  const overlapsCount = (conflicts || []).filter((c) =>
    c.zones.map(String).includes(String(zone?.id ?? ""))
  ).length;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default";
      case "In Review":
        return "secondary";
      case "Draft":
      default:
        return "outline";
    }
  };

  // Robust select handler (works for numeric ids like [{id:1,...}])
  const selectLandUse = (value: string) => {
    const lu = availableLUs.find((l) => String(l.id) === value);
    setEditForm((prev) => ({
      ...prev,
      type: lu?.name ?? prev.type,
      color: lu?.color ?? prev.color,
      landUseId: lu?.id, // preserve the real id (number here)
    }));
    if (zone && lu && onAssignLandUse) {
      onAssignLandUse(zone.id, lu); // updates map + draw feature props in parent
    }
  };

  const handleSave = () => {
    if (!zone) return;
    const updatedZones = zones.map((z) =>
      String(z.id) === String(zone.id)
        ? {
            ...z,
            ...editForm,
            type: editForm.type || z.type,
            color: editForm.color || z.color,
            lastModified: new Date().toISOString().split("T")[0],
          }
        : z
    );
    onUpdateZone(updatedZones);
    setIsEditing(false);
    toast.success("Zone updated");
  };

  const handleDelete = () => {
    if (!zone) return;
    const updatedZones = zones.filter((z) => String(z.id) !== String(zone.id));
    onUpdateZone(updatedZones);
    toast.success("Zone deleted");
  };

  const handleApprove = () => {
    if (!zone) return;
    const updatedZones = zones.map((z) =>
      String(z.id) === String(zone.id) ? { ...z, status: "Approved" } : z
    );
    onUpdateZone(updatedZones);
    toast.success(`Zone ${zone.id} approved`);
  };

  const handleReject = () => {
    if (!zone) return;
    const updatedZones = zones.map((z) =>
      String(z.id) === String(zone.id) ? { ...z, status: "Rejected" } : z
    );
    onUpdateZone(updatedZones);
    toast.error(`Zone ${zone.id} rejected`);
  };

  if (!activeZone || !zone) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">
            Select a zone or draw a new polygon
          </p>
        </div>
      </div>
    );
  }

  const landUseValue =
    editForm.landUseId !== undefined && editForm.landUseId !== null
      ? String(editForm.landUseId)
      : undefined;

  const landUseEmpty = !luLoading && availableLUs.length === 0;

  return (
    <div
      className="p-3 h-full overflow-y-auto max-h-full"
      // avoid bubbling pointer events to the map (helps on some setups)
      onPointerDownCapture={(e) => e.stopPropagation()}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base">Zone Details</h3>
            <p className="text-xs text-muted-foreground">Zone ID: {zone.id}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(zone.status)} className="text-xs">
            {zone.status || "Draft"}
          </Badge>
        </div>

        <Separator />

        <div className="space-y-2">
          {/* Name */}
          <div className="grid grid-cols-5 gap-2">
            {isEditing ? (
              <>
                <span className="text-muted-foreground col-span-2 text-xs">Name:</span>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="col-span-3 h-6 text-xs"
                  placeholder="Enter zone name..."
                />
              </>
            ) : (
              <>
                <span className="text-muted-foreground col-span-2 text-xs">Name:</span>
                <span className="col-span-3 text-xs">
                  {zone.attributes?.name || zone.type}
                </span>
              </>
            )}
          </div>

          {/* Land Use */}
          <div className="grid grid-cols-5 gap-2">
            {isEditing ? (
              <>
                <span className="text-muted-foreground col-span-2 text-xs">Land Use:</span>
                <Select
                  key={zoneKey} // ensure clean mount when switching zones
                  value={landUseValue}
                  onValueChange={selectLandUse}
                  disabled={luLoading || landUseEmpty}
                >
                  <SelectTrigger className="col-span-3 h-6 text-xs">
                    <SelectValue placeholder={luLoading ? "Loading…" : landUseEmpty ? "No options" : "Choose…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLUs.map((lu) => (
                      <SelectItem key={String(lu.id)} value={String(lu.id)}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded"
                            style={{ backgroundColor: lu.color || "#888" }}
                          />
                          <span className="text-xs">{lu.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <span className="text-muted-foreground col-span-2 text-xs">Land Use:</span>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }} />
                  <span className="text-xs">{zone.type}</span>
                </div>
              </>
            )}
          </div>

          {/* Status */}
          <div className="grid grid-cols-5 gap-2">
            <span className="text-muted-foreground col-span-2 text-xs">Status:</span>
            <span className="col-span-3 text-xs">{zone.status || "Draft"}</span>
          </div>

          {/* Points */}
          <div className="grid grid-cols-5 gap-2">
            <span className="text-muted-foreground col-span-2 text-xs">Points:</span>
            <span className="col-span-3 text-xs">
              {zone.coordinates.length} coordinates
            </span>
          </div>

          {/* Color (visible in edit) */}
          {isEditing && (
            <div className="grid grid-cols-5 gap-2">
              <span className="text-muted-foreground col-span-2 text-xs">Color:</span>
              <div className="col-span-3 flex items-center gap-1">
                <Input
                  type="color"
                  value={editForm.color || "#888888"}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, color: e.target.value }))
                  }
                  className="w-6 h-6 p-0 border-0"
                />
                <Input
                  value={editForm.color || ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, color: e.target.value }))
                  }
                  className="flex-1 h-6 text-xs"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm">Notes</Label>
          {isEditing ? (
            <Textarea
              value={editForm.notes}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, notes: e.target.value }))
              }
              rows={3}
              className="text-xs"
              placeholder="Add notes about this zone..."
            />
          ) : (
            <div className="p-2 border rounded bg-background min-h-[60px]">
              <p className="text-xs">{zone.notes || "No notes available"}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Validation */}
        <div className="space-y-2">
          <Label className="text-sm">Validation</Label>
          <div className="grid grid-cols-2 gap-1">
            <Badge variant="default" className="justify-center text-xs py-1">
              <CheckCircle className="w-2 h-2 mr-1" /> Valid
            </Badge>
            <Badge
              variant={overlapsCount > 0 ? "destructive" : "outline"}
              className="justify-center text-xs py-1"
            >
              <AlertTriangle className="w-2 h-2 mr-1" /> Overlaps: {overlapsCount}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex gap-1 pt-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="flex-1 text-xs py-1">
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="text-xs py-1">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)} className="flex-1 text-xs py-1">
                <Edit className="w-3 h-3 mr-1" /> Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="text-xs py-1 px-2">
                <Trash2 className="w-3 h-3" />
              </Button>
              {zone.status !== "Approved" && zone.status !== "Rejected" && (
                <>
                  <Button variant="default" size="sm" onClick={handleApprove} className="text-xs py-1">
                    <ThumbsUp className="w-3 h-3 mr-1" /> Approve
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleReject} className="text-xs py-1">
                    <ThumbsDown className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
