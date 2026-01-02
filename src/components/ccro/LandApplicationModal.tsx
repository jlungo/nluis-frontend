import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { projectService } from "@/services/projects";
import type { TeamMember } from "@/types/projects";

export type LandApplicationStatus =
  | "draft"
  | "pending_verification"
  | "verified"
  | "pending_council"
  | "council_approved"
  | "pending_assembly"
  | "approved"
  | "assigned"
  | "surveying"
  | "survey_complete"
  | "under_review"
  | "completed"
  | "rejected";

const STATUS_LABELS: Partial<Record<LandApplicationStatus, string>> = {
  draft: "Draft",
  pending_verification: "Pending verification",
  verified: "Verified",
  pending_council: "Pending village council",
  council_approved: "Village council approved",
  pending_assembly: "Pending village assembly",
  approved: "Approved",
  assigned: "Assigned",
  surveying: "Surveying",
  survey_complete: "Survey complete",
  under_review: "Under review",
  completed: "Completed",
  rejected: "Rejected",
};

function getStatusLabel(status?: LandApplicationStatus) {
  if (!status) return "";
  return STATUS_LABELS[status] || status;
}

type LandApplication = {
  id: number;
  claim_number?: string;
  registration_number?: string;
  status?: LandApplicationStatus;
  status_display?: string;
  ownership_type?: string;
  ownership_type_display?: string;
  locality_project?: number;
  hamlet?: string | null;
  estimated_area_acres?: number | null;
  current_land_use?: string | null;
  proposed_land_use?: string | null;
  tenure_type?: string;
  tenure_years?: number | null;
  notes?: string | null;
  entity_name?: string | null;
  assigned_surveyor?: number | null;
  parties?: ApplicationParty[];
  neighbors?: ApplicationNeighbor[];
};

type ApplicationParty = {
  id?: number;
  role: string;
  full_name?: string | null;
  age_years?: number | null;
  gender?: string | null;
  citizenship?: string | null;
  citizenship_ref?: string | null;
  birth_certificate_ref?: string | null;
  address?: string | null;
  relationship?: string | null;
  share_percentage?: number | null;
  party?: number | null;
};

type ApplicationNeighbor = {
  id?: number;
  name: string;
  direction: string;
  neighbor_type?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localityProjectId: string;
  projectId: string;
  applicationId?: number;
  disabled?: boolean;
  onSaved?: (applicationId: number) => void;
};

const OWNERSHIP_TYPES: Array<{ value: string; label: string }> = [
  { value: "individual", label: "Individual" },
  { value: "joint_spouse", label: "Joint (Spouse)" },
  { value: "group_resident", label: "Group (Resident)" },
  { value: "group_non_resident", label: "Group (Non-resident)" },
  { value: "institution", label: "Institution" },
];

const TENURE_TYPES: Array<{ value: string; label: string }> = [
  { value: "unlimited", label: "Unlimited" },
  { value: "fixed", label: "Fixed" },
];

function isGroupOwnership(ownershipType: string) {
  return ["group_resident", "group_non_resident", "institution"].includes(ownershipType);
}

function needsGuarantor(ownershipType: string) {
  return ["group_non_resident", "institution"].includes(ownershipType);
}

function hasApplicant(parties: ApplicationParty[]) {
  return parties.some((p) => p.role === "applicant" && !!(p.full_name || "").trim());
}

function hasGuarantor(parties: ApplicationParty[]) {
  return parties.some((p) => p.role === "guarantor" && !!(p.full_name || "").trim());
}

export default function LandApplicationModal({
  open,
  onOpenChange,
  localityProjectId,
  projectId,
  applicationId,
  disabled,
  onSaved,
}: Props) {
  const [activeTab, setActiveTab] = useState<string>("basic");

  const [server, setServer] = useState<LandApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [localId, setLocalId] = useState<number | null>(applicationId ?? null);

  const [ownershipType, setOwnershipType] = useState<string>("individual");
  const [entityName, setEntityName] = useState<string>("");
  const [hamlet, setHamlet] = useState<string>("");
  const [estimatedAreaAcres, setEstimatedAreaAcres] = useState<string>("");
  const [currentLandUse, setCurrentLandUse] = useState<string>("");
  const [proposedLandUse, setProposedLandUse] = useState<string>("");
  const [tenureType, setTenureType] = useState<string>("unlimited");
  const [tenureYears, setTenureYears] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [parties, setParties] = useState<ApplicationParty[]>([]);
  const [neighbors, setNeighbors] = useState<ApplicationNeighbor[]>([]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [selectedSurveyorUserId, setSelectedSurveyorUserId] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const dirtyRef = useRef({ basic: false, parties: false, neighbors: false, surveyor: false });

  const isDirty = useMemo(() => {
    const d = dirtyRef.current;
    return d.basic || d.parties || d.neighbors || d.surveyor;
  }, [
    ownershipType,
    entityName,
    hamlet,
    estimatedAreaAcres,
    currentLandUse,
    proposedLandUse,
    tenureType,
    tenureYears,
    notes,
    parties,
    neighbors,
    selectedSurveyorUserId,
  ]);

  const loadDetail = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/ccro/land-applications/${id}/`);
      const data: LandApplication = res.data;
      setServer(data);

      setOwnershipType(data.ownership_type || "individual");
      setEntityName(data.entity_name || "");
      setHamlet(data.hamlet || "");
      setEstimatedAreaAcres(data.estimated_area_acres == null ? "" : String(data.estimated_area_acres));
      setCurrentLandUse(data.current_land_use || "");
      setProposedLandUse(data.proposed_land_use || "");
      setTenureType(data.tenure_type || "unlimited");
      setTenureYears(data.tenure_years == null ? "" : String(data.tenure_years));
      setNotes(data.notes || "");

      setParties(Array.isArray(data.parties) ? data.parties.map((p) => ({
        id: p.id,
        role: p.role,
        full_name: p.full_name ?? "",
        age_years: p.age_years ?? null,
        gender: p.gender ?? null,
        citizenship: p.citizenship ?? null,
        citizenship_ref: p.citizenship_ref ?? null,
        birth_certificate_ref: p.birth_certificate_ref ?? null,
        address: p.address ?? null,
        relationship: p.relationship ?? null,
        share_percentage: p.share_percentage ?? null,
        party: p.party ?? null,
      })) : []);

      setNeighbors(Array.isArray(data.neighbors) ? data.neighbors.map((n) => ({
        id: n.id,
        name: n.name,
        direction: n.direction,
        neighbor_type: n.neighbor_type || "person",
      })) : []);

      setSelectedSurveyorUserId(data.assigned_surveyor ? String(data.assigned_surveyor) : "");

      dirtyRef.current = { basic: false, parties: false, neighbors: false, surveyor: false };
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || e?.message || "Failed to load application";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTeamMembers = useCallback(async () => {
    if (!projectId) return;
    setTeamLoading(true);
    try {
      const all = await projectService.getTeamMembers(projectId);
      const active = (all || []).filter((m) => m.status === "active");
      setTeamMembers(active);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || e?.message || "Failed to load team members";
      toast.error(msg);
    } finally {
      setTeamLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!open) return;
    setActiveTab("basic");

    const id = applicationId ?? null;
    setLocalId(id);
    setServer(null);

    if (id) {
      loadDetail(id);
    } else {
      setOwnershipType("individual");
      setEntityName("");
      setHamlet("");
      setEstimatedAreaAcres("");
      setCurrentLandUse("");
      setProposedLandUse("");
      setTenureType("unlimited");
      setTenureYears("");
      setNotes("");
      setParties([]);
      setNeighbors([]);
      setSelectedSurveyorUserId("");
      dirtyRef.current = { basic: false, parties: false, neighbors: false, surveyor: false };
    }

    loadTeamMembers();
  }, [open, applicationId, loadDetail, loadTeamMembers]);

  const preview = useMemo(() => {
    const base = server || (localId ? { id: localId } as LandApplication : null);
    const merged: LandApplication = {
      ...(base || ({} as LandApplication)),
      id: base?.id || (localId as number),
      ownership_type: ownershipType,
      hamlet: hamlet || null,
      estimated_area_acres: estimatedAreaAcres.trim() ? Number(estimatedAreaAcres) : null,
      current_land_use: currentLandUse || null,
      proposed_land_use: proposedLandUse || null,
      tenure_type: tenureType,
      tenure_years: tenureType === "fixed" && tenureYears.trim() ? Number(tenureYears) : null,
      notes: notes || null,
      entity_name: isGroupOwnership(ownershipType) ? (entityName || null) : null,
      parties,
      neighbors,
      assigned_surveyor: selectedSurveyorUserId ? Number(selectedSurveyorUserId) : null,
    };
    return merged;
  }, [server, localId, ownershipType, hamlet, estimatedAreaAcres, currentLandUse, proposedLandUse, tenureType, tenureYears, notes, entityName, parties, neighbors, selectedSurveyorUserId]);

  const canSave = !disabled && !!localityProjectId;

  const canSendToFieldWork = useMemo(() => {
    if (disabled) return false;
    if (!selectedSurveyorUserId) return false;
    if (!preview.ownership_type) return false;

    if (isGroupOwnership(preview.ownership_type) && !(preview.entity_name || "").trim()) return false;
    if (!hasApplicant(preview.parties || [])) return false;
    if (needsGuarantor(preview.ownership_type) && !hasGuarantor(preview.parties || [])) return false;

    if (!server?.status) return false;
    if (server.status !== "approved") return false;

    return true;
  }, [disabled, selectedSurveyorUserId, preview, server?.status]);

  const persistBasic = async (id?: number) => {
    const payload: any = {
      ownership_type: ownershipType,
      locality_project: Number(localityProjectId),
      hamlet: hamlet.trim() ? hamlet.trim() : null,
      estimated_area_acres: estimatedAreaAcres.trim() ? Number(estimatedAreaAcres) : null,
      current_land_use: currentLandUse.trim() ? currentLandUse.trim() : null,
      proposed_land_use: proposedLandUse.trim() ? proposedLandUse.trim() : null,
      tenure_type: tenureType,
      tenure_years: tenureType === "fixed" && tenureYears.trim() ? Number(tenureYears) : null,
      notes: notes.trim() ? notes.trim() : null,
    };

    if (isGroupOwnership(ownershipType)) {
      payload.entity_name = entityName.trim() ? entityName.trim() : null;
    }

    if (!id) {
      const res = await api.post(`/ccro/land-applications/`, payload);
      return res.data as LandApplication;
    }

    const res = await api.patch(`/ccro/land-applications/${id}/`, payload);
    return res.data as LandApplication;
  };

  const syncParties = async (appId: number) => {
    const existing = server?.parties || [];
    const existingIds = new Set(existing.map((p) => p.id).filter(Boolean) as number[]);
    const nextIds = new Set(parties.map((p) => p.id).filter(Boolean) as number[]);

    const toDelete = Array.from(existingIds).filter((id) => !nextIds.has(id));

    for (const id of toDelete) {
      await api.delete(`/ccro/application-parties/${id}/`);
    }

    for (const p of parties) {
      const payload: any = {
        application: appId,
        role: p.role,
        full_name: (p.full_name || "").trim() || null,
        age_years: p.age_years == null ? null : Number(p.age_years),
        gender: (p.gender || "").trim() || null,
        citizenship: (p.citizenship || "").trim() || null,
        citizenship_ref: (p.citizenship_ref || "").trim() || null,
        birth_certificate_ref: (p.birth_certificate_ref || "").trim() || null,
        address: (p.address || "").trim() || null,
        relationship: (p.relationship || "").trim() || null,
        share_percentage: p.share_percentage == null ? null : Number(p.share_percentage),
        party: p.party ?? null,
      };

      if (!p.id) {
        const res = await api.post(`/ccro/application-parties/`, payload);
        p.id = res.data?.id;
      } else {
        await api.patch(`/ccro/application-parties/${p.id}/`, payload);
      }
    }

    setParties([...parties]);
  };

  const syncNeighbors = async (appId: number) => {
    const existing = server?.neighbors || [];
    const existingIds = new Set(existing.map((n) => n.id).filter(Boolean) as number[]);
    const nextIds = new Set(neighbors.map((n) => n.id).filter(Boolean) as number[]);

    const toDelete = Array.from(existingIds).filter((id) => !nextIds.has(id));

    for (const id of toDelete) {
      await api.delete(`/ccro/application-neighbors/${id}/`);
    }

    for (const n of neighbors) {
      const payload: any = {
        application: appId,
        name: (n.name || "").trim(),
        direction: n.direction,
        neighbor_type: n.neighbor_type || "person",
      };

      if (!n.id) {
        const res = await api.post(`/ccro/application-neighbors/`, payload);
        n.id = res.data?.id;
      } else {
        await api.patch(`/ccro/application-neighbors/${n.id}/`, payload);
      }
    }

    setNeighbors([...neighbors]);
  };

  const handleSave = async () => {
    if (!canSave) return;

    setIsSaving(true);
    try {
      const app = await persistBasic(localId ?? undefined);
      const id = app.id;
      setLocalId(id);

      await syncParties(id);
      await syncNeighbors(id);

      await loadDetail(id);
      toast.success("Saved");
      onSaved?.(id);
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        (typeof e?.response?.data === "object" ? JSON.stringify(e.response.data) : null) ||
        e?.message ||
        "Save failed";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToFieldWork = async () => {
    if (!canSendToFieldWork) return;
    if (!localId) {
      toast.error("Save the application first");
      return;
    }

    setIsSending(true);
    try {
      await handleSave();

      const id = localId;
      await api.post(`/ccro/land-applications/${id}/assign_surveyor/`, {
        surveyor_id: Number(selectedSurveyorUserId),
      });

      await loadDetail(id);
      toast.success("Surveyor assigned. Application is now ready for field work.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        (typeof e?.response?.data === "object" ? JSON.stringify(e.response.data) : null) ||
        e?.message ||
        "Failed to assign surveyor";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty && !disabled) {
      const ok = window.confirm("You have unsaved changes. Close anyway? Unsaved edits will be lost.");
      if (!ok) return;
    }
    onOpenChange(nextOpen);
  };

  const partyColumns: ColumnDef<ApplicationParty>[] = useMemo(() => {
    return [
      { id: "role", header: "Role", accessorFn: (r) => r.role },
      { id: "name", header: "Full name", accessorFn: (r) => r.full_name || "" },
      { id: "relationship", header: "Relationship", accessorFn: (r) => r.relationship || "" },
      { id: "age", header: "Age", accessorFn: (r) => (r.age_years == null ? "" : String(r.age_years)) },
      { id: "gender", header: "Gender", accessorFn: (r) => r.gender || "" },
      { id: "citizenship", header: "Citizenship", accessorFn: (r) => r.citizenship || "" },
      { id: "kumb", header: "Citizenship ref (KUMB)", accessorFn: (r) => r.citizenship_ref || "" },
      { id: "cheti", header: "Birth cert ref (CHETI)", accessorFn: (r) => r.birth_certificate_ref || "" },
      { id: "address", header: "Address", accessorFn: (r) => r.address || "" },
      {
        id: "share",
        header: "Share %",
        accessorFn: (r) => (r.share_percentage == null ? "" : String(r.share_percentage)),
      },
    ];
  }, []);

  const neighborColumns: ColumnDef<ApplicationNeighbor>[] = useMemo(() => {
    return [
      { id: "name", header: "Name", accessorFn: (r) => r.name },
      { id: "direction", header: "Direction", accessorFn: (r) => r.direction },
      { id: "type", header: "Type", accessorFn: (r) => r.neighbor_type || "person" },
    ];
  }, []);

  const assignedSurveyorLabel = useMemo(() => {
    if (!selectedSurveyorUserId) return "";
    const m = teamMembers.find((x) => String(x.user_id || "") === selectedSurveyorUserId || String(x.id) === selectedSurveyorUserId);
    return m?.name || m?.email || `User #${selectedSurveyorUserId}`;
  }, [selectedSurveyorUserId, teamMembers]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {localId ? `Land Application #${localId}` : "New Land Application"}
            {server?.claim_number ? ` (${server.claim_number})` : ""}
            {server?.status ? ` — ${getStatusLabel(server.status)}` : ""}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="w-full flex flex-wrap h-auto">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="neighbors">Neighbors</TabsTrigger>
            <TabsTrigger value="surveyor">Surveyor</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="max-h-[60vh] overflow-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ownership Type</Label>
                <Select
                  value={ownershipType}
                  onValueChange={(v) => {
                    dirtyRef.current.basic = true;
                    setOwnershipType(v);
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ownership type" />
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
                <Label>Hamlet</Label>
                <Input
                  value={hamlet}
                  onChange={(e) => {
                    dirtyRef.current.basic = true;
                    setHamlet(e.target.value);
                  }}
                  disabled={disabled}
                />
              </div>

              {isGroupOwnership(ownershipType) ? (
                <div className="space-y-2 md:col-span-2">
                  <Label>Entity name</Label>
                  <Input
                    value={entityName}
                    onChange={(e) => {
                      dirtyRef.current.basic = true;
                      setEntityName(e.target.value);
                    }}
                    disabled={disabled}
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label>Estimated area (acres)</Label>
                <Input
                  value={estimatedAreaAcres}
                  onChange={(e) => {
                    dirtyRef.current.basic = true;
                    setEstimatedAreaAcres(e.target.value);
                  }}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Tenure type</Label>
                <Select
                  value={tenureType}
                  onValueChange={(v) => {
                    dirtyRef.current.basic = true;
                    setTenureType(v);
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tenure type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TENURE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {tenureType === "fixed" ? (
                <div className="space-y-2">
                  <Label>Tenure years</Label>
                  <Input
                    value={tenureYears}
                    onChange={(e) => {
                      dirtyRef.current.basic = true;
                      setTenureYears(e.target.value);
                    }}
                    disabled={disabled}
                  />
                </div>
              ) : null}

              <div className="space-y-2 md:col-span-2">
                <Label>Current land use</Label>
                <Input
                  value={currentLandUse}
                  onChange={(e) => {
                    dirtyRef.current.basic = true;
                    setCurrentLandUse(e.target.value);
                  }}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Proposed land use</Label>
                <Input
                  value={proposedLandUse}
                  onChange={(e) => {
                    dirtyRef.current.basic = true;
                    setProposedLandUse(e.target.value);
                  }}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Notes</Label>
                <Input
                  value={notes}
                  onChange={(e) => {
                    dirtyRef.current.basic = true;
                    setNotes(e.target.value);
                  }}
                  disabled={disabled}
                />
              </div>
            </div>
            </div>
          </TabsContent>

          <TabsContent value="parties">
            <div className="max-h-[60vh] overflow-auto pr-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                At least one applicant is required before sending to field work.
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => {
                  dirtyRef.current.parties = true;
                  setParties((prev) => [
                    ...prev,
                    {
                      role: "member",
                      full_name: "",
                      relationship: null,
                      age_years: null,
                      gender: null,
                      citizenship: null,
                      citizenship_ref: null,
                      birth_certificate_ref: null,
                      address: null,
                      share_percentage: null,
                      party: null,
                    },
                  ]);
                }}
              >
                Add party
              </Button>
            </div>

            <DataTable
              columns={partyColumns}
              data={parties}
              shadowed={false}
              enableGlobalFilter={false}
              showPagination={false}
              emptyText="No parties added"
              rowActions={
                disabled
                  ? undefined
                  : (row) => (
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const i = parties.indexOf(row);
                            if (i < 0) return;
                            const role = prompt("Role (applicant/spouse/member/guarantor)", row.role) || row.role;
                            const full = prompt("Full name", row.full_name || "") ?? (row.full_name || "");
                            const relationship = prompt("Relationship (optional)", row.relationship || "") ?? (row.relationship || "");
                            const ageRaw = prompt("Age years (optional)", row.age_years == null ? "" : String(row.age_years));
                            const age = ageRaw == null || ageRaw.trim() === "" ? null : Number(ageRaw);
                            const gender = (prompt("Gender (male/female) (optional)", row.gender || "") ?? (row.gender || "")).trim();
                            const citizenship = prompt("Citizenship (optional)", row.citizenship || "") ?? (row.citizenship || "");
                            const kumb =
                              prompt("Citizenship reference (KUMB) (optional)", row.citizenship_ref || "") ??
                              (row.citizenship_ref || "");
                            const cheti =
                              prompt("Birth certificate reference (CHETI) (optional)", row.birth_certificate_ref || "") ??
                              (row.birth_certificate_ref || "");
                            const address = prompt("Address (optional)", row.address || "") ?? (row.address || "");
                            const shareRaw = prompt("Share % (optional)", row.share_percentage == null ? "" : String(row.share_percentage));
                            const share = shareRaw == null || shareRaw === "" ? null : Number(shareRaw);
                            dirtyRef.current.parties = true;
                            setParties((prev) =>
                              prev.map((p, idx) =>
                                idx === i
                                  ? {
                                      ...p,
                                      role,
                                      full_name: full,
                                      relationship: relationship.trim() ? relationship.trim() : null,
                                      age_years: age,
                                      gender: gender ? gender : null,
                                      citizenship: citizenship.trim() ? citizenship.trim() : null,
                                      citizenship_ref: kumb.trim() ? kumb.trim() : null,
                                      birth_certificate_ref: cheti.trim() ? cheti.trim() : null,
                                      address: address.trim() ? address.trim() : null,
                                      share_percentage: share,
                                    }
                                  : p
                              )
                            );
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => {
                            const i = parties.indexOf(row);
                            if (i < 0) return;
                            if (!confirm("Remove this party?") ) return;
                            dirtyRef.current.parties = true;
                            setParties((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )
              }
            />
            </div>
          </TabsContent>

          <TabsContent value="neighbors">
            <div className="max-h-[60vh] overflow-auto pr-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Neighbors can be filled now or later.</div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => {
                  dirtyRef.current.neighbors = true;
                  setNeighbors((prev) => [
                    ...prev,
                    { name: "", direction: "N", neighbor_type: "person" },
                  ]);
                }}
              >
                Add neighbor
              </Button>
            </div>

            <DataTable
              columns={neighborColumns}
              data={neighbors}
              shadowed={false}
              enableGlobalFilter={false}
              showPagination={false}
              emptyText="No neighbors added"
              rowActions={
                disabled
                  ? undefined
                  : (row) => (
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const i = neighbors.indexOf(row);
                            if (i < 0) return;
                            const name = prompt("Name", row.name) ?? row.name;
                            const dir = prompt("Direction (N,S,E,W,NE,NW,SE,SW)", row.direction) ?? row.direction;
                            const typ = prompt("Type (person/village/road/...)", row.neighbor_type || "person") ?? (row.neighbor_type || "person");
                            dirtyRef.current.neighbors = true;
                            setNeighbors((prev) =>
                              prev.map((n, idx) => (idx === i ? { ...n, name, direction: dir, neighbor_type: typ } : n))
                            );
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => {
                            const i = neighbors.indexOf(row);
                            if (i < 0) return;
                            if (!confirm("Remove this neighbor?") ) return;
                            dirtyRef.current.neighbors = true;
                            setNeighbors((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )
              }
            />
            </div>
          </TabsContent>

          <TabsContent value="surveyor">
            <div className="max-h-[60vh] overflow-auto pr-1">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Select a surveyor from the project team members list.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Surveyor (project member)</Label>
                  <Select
                    value={selectedSurveyorUserId}
                    onValueChange={(v) => {
                      dirtyRef.current.surveyor = true;
                      setSelectedSurveyorUserId(v);
                    }}
                    disabled={disabled || teamLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={teamLoading ? "Loading..." : "Select member"} />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((m) => {
                        const userId = m.user_id ? String(m.user_id) : "";
                        if (!userId) return null;
                        const label = m.name || m.email || `Member ${m.id}`;
                        return (
                          <SelectItem key={m.id} value={userId}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Selected</Label>
                  <Input value={assignedSurveyorLabel} disabled />
                </div>
              </div>

              {server?.status && server.status !== "approved" ? (
                <div className="text-sm text-muted-foreground">
                  Surveyor assignment requires status = "approved". Current status: {getStatusLabel(server.status)}.
                </div>
              ) : null}
            </div>
            </div>
          </TabsContent>

          <TabsContent value="workflow">
            <div className="max-h-[60vh] overflow-auto pr-1">
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-medium">{server?.status ? getStatusLabel(server.status) : "-"}</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-muted-foreground">Claim No.</div>
                  <div className="font-medium">{server?.claim_number || "-"}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Workflow actions (verify/approvals/etc.) can be added here next.
              </div>
            </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="max-h-[60vh] overflow-auto pr-1">
            {isDirty ? (
              <div className="border rounded p-3 bg-accent text-sm">
                Preview includes unsaved changes. Click Save to persist, otherwise changes may be lost.
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Ownership</div>
                <div className="font-medium">{preview.ownership_type || "-"}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Entity</div>
                <div className="font-medium">{preview.entity_name || "-"}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Hamlet</div>
                <div className="font-medium">{preview.hamlet || "-"}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Estimated area (acres)</div>
                <div className="font-medium">{preview.estimated_area_acres == null ? "-" : String(preview.estimated_area_acres)}</div>
              </div>
              <div className="border rounded p-3 md:col-span-2">
                <div className="text-xs text-muted-foreground">Notes</div>
                <div className="font-medium">{preview.notes || "-"}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="font-medium mb-2">Parties</div>
              <DataTable
                columns={partyColumns}
                data={preview.parties || []}
                shadowed={false}
                enableGlobalFilter={false}
                showPagination={false}
                emptyText="No parties"
              />
            </div>

            <div className="mt-4">
              <div className="font-medium mb-2">Neighbors</div>
              <DataTable
                columns={neighborColumns}
                data={preview.neighbors || []}
                shadowed={false}
                enableGlobalFilter={false}
                showPagination={false}
                emptyText="No neighbors"
              />
            </div>

            <div className="mt-4 border rounded p-3">
              <div className="text-xs text-muted-foreground">Selected surveyor</div>
              <div className="font-medium">{assignedSurveyorLabel || "-"}</div>
            </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave || isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            onClick={handleSendToFieldWork}
            disabled={!canSendToFieldWork || isSending || isSaving || isLoading}
          >
            {isSending ? "Sending..." : "Send to Field Work"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
