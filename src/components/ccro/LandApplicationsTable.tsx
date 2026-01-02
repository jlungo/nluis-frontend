import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/axios";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export type LandApplicationsTableMode = "application" | "review";
export type LandApplicationsTableScope = "project" | "global";

type LandApplicationListItem = {
  id: number;
  claim_number?: string;
  registration_number?: string | null;
  ownership_type?: string;
  ownership_type_display?: string;
  status?: string;
  status_display?: string;
  entity_name?: string | null;
  locality_project?: number;
  locality_name?: string;
  estimated_area_acres?: number | null;
  applicant_count?: number;
  primary_applicant_name?: string | null;
  submitted_at?: string | null;
  created_at?: string;
};

type ListResponse = {
  results?: LandApplicationListItem[];
};

type Props = {
  mode: LandApplicationsTableMode;
  scope: LandApplicationsTableScope;
  localityProjectId?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

const OWNERSHIP_TYPES: Array<{ value: string; label: string }> = [
  { value: "individual", label: "Individual" },
  { value: "joint_spouse", label: "Joint (Spouse)" },
  { value: "group_resident", label: "Group (Resident)" },
  { value: "group_non_resident", label: "Group (Non-resident)" },
  { value: "institution", label: "Institution" },
];

function isGroupOwnership(ownershipType: string) {
  return ["group_resident", "group_non_resident", "institution"].includes(ownershipType);
}

function needsGuarantor(ownershipType: string) {
  return ["group_non_resident", "institution"].includes(ownershipType);
}

export default function LandApplicationsTable({
  mode,
  scope,
  localityProjectId,
  disabled,
  onValueChange,
}: Props) {
  const [items, setItems] = useState<LandApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onValueChangeRef = useRef<Props["onValueChange"]>(onValueChange);
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [ownershipType, setOwnershipType] = useState<string>("individual");
  const [applicantName, setApplicantName] = useState<string>("");
  const [entityName, setEntityName] = useState<string>("");
  const [guarantorName, setGuarantorName] = useState<string>("");
  const [estimatedAreaAcres, setEstimatedAreaAcres] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const canCreate = mode === "application" && scope === "project" && !disabled;

  const load = useCallback(async () => {
    if (scope === "project" && !localityProjectId) return;

    setIsLoading(true);
    setError(null);
    try {
      const url =
        scope === "project"
          ? `/ccro/land-applications/?locality_project=${encodeURIComponent(localityProjectId as string)}`
          : `/ccro/land-applications/`;

      const res = await api.get(url);
      const data = res.data as ListResponse | LandApplicationListItem[];
      const results = Array.isArray(data) ? data : data?.results || [];
      setItems(results);
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to load land applications";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [scope, localityProjectId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const cb = onValueChangeRef.current;
    if (!cb) return;
    const ids = items.map((r) => r.id);
    cb(ids.length ? JSON.stringify(ids) : "");
  }, [items]);

  const handleCreate = async () => {
    if (!canCreate) return;
    if (!localityProjectId) {
      toast.error("Missing locality project id");
      return;
    }

    const requiresEntity = isGroupOwnership(ownershipType);
    const requiresGuarantor = needsGuarantor(ownershipType);

    if (!applicantName.trim()) {
      toast.error("Applicant name is required");
      return;
    }
    if (requiresEntity && !entityName.trim()) {
      toast.error("Entity name is required for this ownership type");
      return;
    }
    if (requiresGuarantor && !guarantorName.trim()) {
      toast.error("At least one guarantor is required for this ownership type");
      return;
    }

    setCreating(true);
    try {
      const payload: any = {
        ownership_type: ownershipType,
        locality_project: Number(localityProjectId),
        estimated_area_acres: estimatedAreaAcres.trim() ? Number(estimatedAreaAcres) : null,
        notes: notes.trim() ? notes.trim() : null,
        parties: [
          {
            party_order: 1,
            role: "applicant",
            full_name: applicantName.trim(),
            share_percentage: 100,
          },
        ],
      };

      if (isGroupOwnership(ownershipType)) {
        payload.entity_name = entityName.trim();
      }

      if (needsGuarantor(ownershipType)) {
        payload.parties.push({
          party_order: 2,
          role: "guarantor",
          full_name: guarantorName.trim(),
          share_percentage: null,
        });
      }

      await api.post(`/ccro/land-applications/`, payload);
      toast.success("Application created (draft)");
      setCreateOpen(false);

      // Reset minimal form
      setOwnershipType("individual");
      setApplicantName("");
      setEntityName("");
      setGuarantorName("");
      setEstimatedAreaAcres("");
      setNotes("");

      await load();
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        (typeof e?.response?.data === "object" ? JSON.stringify(e.response.data) : null) ||
        e?.message ||
        "Failed to create application";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateCertificate = async (row: LandApplicationListItem) => {
    if (disabled) return;
    try {
      await api.post(`/ccro/land-applications/${row.id}/generate_certificate/`);
      toast.success("Certificate generated (or already exists)");
      await load();
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object" ? JSON.stringify(e.response.data) : null) ||
        e?.message ||
        "Failed to generate certificate";
      toast.error(msg);
    }
  };

  const handleSubmit = async (row: LandApplicationListItem) => {
    if (disabled) return;
    try {
      await api.post(`/ccro/land-applications/${row.id}/submit/`);
      toast.success("Submitted for verification");
      await load();
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object" ? JSON.stringify(e.response.data) : null) ||
        e?.message ||
        "Failed to submit";
      toast.error(msg);
    }
  };

  const columns: ColumnDef<LandApplicationListItem>[] = useMemo(() => {
    return [
      {
        id: "claim_number",
        header: "Claim No.",
        accessorFn: (row) => row.claim_number || `#${row.id}`,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.claim_number || `#${row.original.id}`}</span>
        ),
      },
      {
        id: "registration_number",
        header: "Registration No.",
        accessorFn: (row) => row.registration_number || "-",
      },
      {
        id: "applicant",
        header: "Applicant",
        accessorFn: (row) => row.primary_applicant_name || row.entity_name || "-",
        cell: ({ row }) => (
          <span>{row.original.primary_applicant_name || row.original.entity_name || "-"}</span>
        ),
      },
      {
        id: "ownership",
        header: "Ownership",
        accessorFn: (row) => row.ownership_type_display || row.ownership_type || "-",
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status_display || row.status || "-",
      },
      {
        id: "locality",
        header: "Locality",
        accessorFn: (row) => row.locality_name || "-",
      },
      {
        id: "created",
        header: "Created",
        accessorFn: (row) => row.created_at || "-",
        cell: ({ row }) => {
          const v = row.original.created_at;
          if (!v) return "-";
          const d = new Date(v);
          return isNaN(d.getTime()) ? v : d.toLocaleString();
        },
      },
    ];
  }, []);

  const rowActions = useCallback(
    (row: LandApplicationListItem) => {
      if (mode === "application") {
        return (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || row.status !== "draft"}
              onClick={() => handleSubmit(row)}
            >
              Submit
            </Button>
          </div>
        );
      }

      return (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || row.status !== "completed"}
            onClick={() => handleGenerateCertificate(row)}
          >
            Generate Certificate
          </Button>
        </div>
      );
    },
    [mode, disabled]
  );

  const rightToolbar = useMemo(() => {
    if (!canCreate) {
      return (
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={isLoading}>
          Refresh
        </Button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={isLoading}>
          Refresh
        </Button>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)} disabled={isLoading}>
          Add New
        </Button>
      </div>
    );
  }, [canCreate, load, isLoading]);

  const emptyText = scope === "project" ? "No applications found for this project" : "No applications found";

  return (
    <div className="w-full space-y-3">
      {error ? <div className="text-sm text-destructive break-words">{error}</div> : null}

      <DataTable
        columns={columns}
        data={items}
        showRowNumbers
        isLoading={isLoading}
        searchPlaceholder="Search applications..."
        rightToolbar={rightToolbar}
        rowActions={rowActions}
        emptyText={emptyText}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Land Application (Draft)</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ownership Type</Label>
              <Select value={ownershipType} onValueChange={setOwnershipType} disabled={creating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ownership" />
                </SelectTrigger>
                <SelectContent>
                  {OWNERSHIP_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estimated Area (Acres)</Label>
              <Input value={estimatedAreaAcres} onChange={(e) => setEstimatedAreaAcres(e.target.value)} disabled={creating} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Applicant Name</Label>
              <Input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} disabled={creating} />
            </div>

            {isGroupOwnership(ownershipType) ? (
              <div className="space-y-2 md:col-span-2">
                <Label>Entity Name</Label>
                <Input value={entityName} onChange={(e) => setEntityName(e.target.value)} disabled={creating} />
              </div>
            ) : null}

            {needsGuarantor(ownershipType) ? (
              <div className="space-y-2 md:col-span-2">
                <Label>Guarantor Name</Label>
                <Input value={guarantorName} onChange={(e) => setGuarantorName(e.target.value)} disabled={creating} />
              </div>
            ) : null}

            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} disabled={creating} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
