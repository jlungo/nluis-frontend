import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
  presented_by_party?: number | null;
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

type PartyListItem = {
  id: number;
  party_type: "individual" | "organization";
  name: string;
  contact?: string | null;
  nida_number?: string | null;
  nida_verified?: boolean | null;
};

type PartyRegistryTypeFilter = "all" | "individual" | "organization";

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
  return parties.some((p) => p.role === "owner" && p.party != null);
}

function hasGuarantor(parties: ApplicationParty[]) {
  return parties.some((p) => p.role === "guarantor" && p.party != null);
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
  const [presentedByPartyId, setPresentedByPartyId] = useState<number | null>(null);
  const [hamlet, setHamlet] = useState<string>("");
  const [estimatedAreaAcres, setEstimatedAreaAcres] = useState<string>("");
  const [currentLandUse, setCurrentLandUse] = useState<string>("");
  const [proposedLandUse, setProposedLandUse] = useState<string>("");
  const [tenureType, setTenureType] = useState<string>("unlimited");
  const [tenureYears, setTenureYears] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [parties, setParties] = useState<ApplicationParty[]>([]);
  const [neighbors, setNeighbors] = useState<ApplicationNeighbor[]>([]);

  const [partyRegistry, setPartyRegistry] = useState<PartyListItem[]>([]);
  const [partyRegistryLoading, setPartyRegistryLoading] = useState(false);
  const [partyRegistrySearch, setPartyRegistrySearch] = useState("");
  const [partyPickerOpenIndex, setPartyPickerOpenIndex] = useState<number | null>(null);
  const [ownerAddOpen, setOwnerAddOpen] = useState(false);
  const [familyAddOpen, setFamilyAddOpen] = useState(false);
  const [repPickerOpen, setRepPickerOpen] = useState(false);
  const [partyRegistryType, setPartyRegistryType] = useState<PartyRegistryTypeFilter>("all");
  const [partyRegistryPage, setPartyRegistryPage] = useState(1);
  const [partyRegistryHasNext, setPartyRegistryHasNext] = useState(false);

  const partyRegistrySearchRef = useRef("");
  const partyRegistryTypeRef = useRef<PartyRegistryTypeFilter>("all");

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
    presentedByPartyId,
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
      setPresentedByPartyId(data.presented_by_party ?? null);
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
        full_name: "",
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
    partyRegistrySearchRef.current = partyRegistrySearch;
  }, [partyRegistrySearch]);

  useEffect(() => {
    partyRegistryTypeRef.current = partyRegistryType;
  }, [partyRegistryType]);

  const loadPartyRegistry = useCallback(
    async ({ page, append }: { page: number; append: boolean }) => {
      setPartyRegistryLoading(true);
      try {
        const params = new URLSearchParams();
        const q = (partyRegistrySearchRef.current || "").trim();
        if (q) params.set("search", q);
        const typ = partyRegistryTypeRef.current;
        if (typ !== "all") params.set("party_type", typ);
        params.set("page", String(page));

        const res = await api.get(`/ccro/parties/?${params.toString()}`);
        const data = res.data as any;

        const results = Array.isArray(data) ? data : data?.results || [];
        const hasNext = Array.isArray(data) ? false : Boolean(data?.next);

        setPartyRegistry((prev) => (append ? [...prev, ...(results as PartyListItem[])] : (results as PartyListItem[])));
        setPartyRegistryHasNext(hasNext);
        setPartyRegistryPage(page);
      } catch (e: any) {
        const msg = e?.response?.data?.detail || e?.response?.data?.error || e?.message || "Failed to load parties";
        toast.error(msg);
      } finally {
        setPartyRegistryLoading(false);
      }
    },
    []
  );

  const partyLabelById = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of partyRegistry) {
      map.set(p.id, p.name);
    }
    return map;
  }, [partyRegistry]);

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
      setPresentedByPartyId(null);
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
    loadPartyRegistry({ page: 1, append: false });
  }, [open, applicationId, loadDetail, loadTeamMembers, loadPartyRegistry]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      setPartyRegistry([]);
      setPartyRegistryHasNext(false);
      loadPartyRegistry({ page: 1, append: false });
    }, 250);
    return () => window.clearTimeout(t);
  }, [open, partyRegistrySearch, partyRegistryType, loadPartyRegistry]);

  const handlePartyRegistryScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (partyRegistryLoading) return;
      if (!partyRegistryHasNext) return;

      const el = e.currentTarget;
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48;
      if (!nearBottom) return;

      loadPartyRegistry({ page: partyRegistryPage + 1, append: true });
    },
    [partyRegistryLoading, partyRegistryHasNext, partyRegistryPage, loadPartyRegistry]
  );

  const preview = useMemo(() => {
    const base = server || (localId ? { id: localId } as LandApplication : null);
    const merged: LandApplication = {
      ...(base || ({} as LandApplication)),
      id: base?.id || (localId as number),
      ownership_type: ownershipType,
      presented_by_party: presentedByPartyId,
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
      presented_by_party: presentedByPartyId,
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
    return { ...(res.data as any), id } as LandApplication;
  };

  const syncParties = async (appId: number) => {
    const existing = server?.parties || [];
    const existingIds = new Set(existing.map((p) => p.id).filter(Boolean) as number[]);
    const nextIds = new Set(parties.map((p) => p.id).filter(Boolean) as number[]);

    const ownerCount = parties.filter((p) => p.role === "owner" || p.role === "co_owner").length;

    const toDelete = Array.from(existingIds).filter((id) => !nextIds.has(id));

    for (const id of toDelete) {
      await api.delete(`/ccro/application-parties/${id}/`);
    }

    for (const p of parties) {
      const normalizedShare =
        ownerCount === 1 && (p.role === "owner" || p.role === "co_owner") ? 100 : p.share_percentage;
      const payload: any = {
        application: appId,
        role: p.role,
        age_years: p.age_years == null ? null : Number(p.age_years),
        gender: (p.gender || "").trim() || null,
        citizenship: (p.citizenship || "").trim() || null,
        citizenship_ref: (p.citizenship_ref || "").trim() || null,
        birth_certificate_ref: (p.birth_certificate_ref || "").trim() || null,
        address: (p.address || "").trim() || null,
        relationship: (p.relationship || "").trim() || null,
        share_percentage: normalizedShare == null ? null : Number(normalizedShare),
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

    if (presentedByPartyId == null) {
      toast.error("Presented by party is required");
      return;
    }

    const owners = (parties || []).filter((p) => p.role === "owner" || p.role === "co_owner");
    if (owners.length < 1) {
      toast.error("Add at least one owner before saving");
      return;
    }

    if (owners.length > 1) {
      if (owners.some((p) => p.share_percentage == null || Number.isNaN(Number(p.share_percentage)))) {
        toast.error("Enter share % for all owners");
        return;
      }
      const sum = owners.reduce((acc, p) => acc + Number(p.share_percentage || 0), 0);
      const rounded = Math.round(sum * 100) / 100;
      if (Math.abs(rounded - 100) > 0.01) {
        toast.error(`Owner shares must sum to 100 (current: ${rounded})`);
        return;
      }
    }

    if ((parties || []).some((p) => p.party == null)) {
      toast.error("Select a party from the registry for all party rows before saving");
      return;
    }

    setIsSaving(true);
    try {
      const app = await persistBasic(localId ?? undefined);
      const id = (localId ?? app.id) as number | undefined;
      if (!id) {
        throw new Error("Missing application id after save");
      }
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
      {
        id: "party",
        header: "Party",
        accessorFn: (r) => {
          if (r.party == null) return "";
          const label = partyLabelById.get(r.party);
          return label ? label : `#${r.party}`;
        },
      },
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
  }, [partyLabelById]);

  const ownerColumns: ColumnDef<ApplicationParty>[] = useMemo(() => {
    return [
      {
        id: "owner",
        header: "Owner",
        accessorFn: (r) => {
          if (r.party == null) return "";
          const label = partyLabelById.get(r.party);
          return label ? label : `#${r.party}`;
        },
      },
      {
        id: "type",
        header: "Type",
        accessorFn: (r) => (r.role === "owner" ? "Primary" : "Co-owner"),
      },
      {
        id: "share",
        header: "Share %",
        accessorFn: (r) => (r.share_percentage == null ? "" : String(r.share_percentage)),
      },
    ];
  }, [partyLabelById]);

  const familyColumns: ColumnDef<ApplicationParty>[] = useMemo(() => {
    return [
      {
        id: "party",
        header: "Party",
        accessorFn: (r) => {
          if (r.party == null) return "";
          const label = partyLabelById.get(r.party);
          return label ? label : `#${r.party}`;
        },
      },
      { id: "role", header: "Role", accessorFn: (r) => (r.role === "spouse" ? "Spouse" : "Family member") },
      { id: "relationship", header: "Relationship", accessorFn: (r) => r.relationship || "" },
    ];
  }, [partyLabelById]);

  const recalcOwnerShares = useCallback(() => {
    dirtyRef.current.parties = true;
    setParties((prev) => {
      const ownerIdx = prev
        .map((p, idx) => ({ p, idx }))
        .filter(({ p }) => p.role === "owner" || p.role === "co_owner");

      const n = ownerIdx.length;
      if (n === 0) return prev;

      const next = [...prev];

      if (n === 1) {
        const i = ownerIdx[0].idx;
        next[i] = { ...next[i], role: "owner", share_percentage: 100 };
        return next;
      }

      const base = Math.floor((100 / n) * 100) / 100;
      let remainder = 100 - base * (n - 1);
      remainder = Math.round(remainder * 100) / 100;

      ownerIdx.forEach(({ idx }, k) => {
        next[idx] = { ...next[idx], role: k === 0 ? "owner" : "co_owner", share_percentage: k === n - 1 ? remainder : base };
      });
      return next;
    });
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
      <DialogContent className="flex flex-col w-[95vw] sm:w-[80vw] max-w-none sm:max-w-none h-[70vh] max-h-[70vh] overflow-visible">
        <DialogHeader>
          <DialogTitle>
            {localId ? `Land Application #${localId}` : "New Land Application"}
            {server?.claim_number ? ` (${server.claim_number})` : ""}
            {server?.status ? ` — ${getStatusLabel(server.status)}` : ""}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 overflow-hidden">
          <TabsList className="w-full flex flex-wrap h-auto">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="owners">Owners</TabsTrigger>
            <TabsTrigger value="representative">Representative</TabsTrigger>
            {isGroupOwnership(ownershipType) ? null : <TabsTrigger value="family">Family</TabsTrigger>}
            <TabsTrigger value="neighbors">Neighbors</TabsTrigger>
            <TabsTrigger value="surveyor">Surveyor</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="max-h-[60vh] overflow-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Presented by (Party)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-start" disabled={disabled}>
                      {presentedByPartyId == null
                        ? "Select party"
                        : partyLabelById.get(presentedByPartyId) || `Party #${presentedByPartyId}`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[420px] max-w-[calc(80vw-3rem)] p-0"
                    align="start"
                    portal={false}
                    onInteractOutside={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onFocusOutside={(e) => e.preventDefault()}
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search party name or NIDA..."
                        value={partyRegistrySearch}
                        onValueChange={setPartyRegistrySearch}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                      />
                      <CommandList onScroll={handlePartyRegistryScroll}>
                        <CommandEmpty>
                          {partyRegistryLoading ? "Loading..." : "No party found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {partyRegistry.map((p) => (
                            <CommandItem
                              key={p.id}
                              onSelect={() => {
                                dirtyRef.current.basic = true;
                                setPresentedByPartyId(p.id);
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <div className="text-sm">{p.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {p.party_type}
                                  {p.nida_number ? ` • ${p.nida_number}` : ""}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

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

          <TabsContent value="owners">
            <div className="max-h-[60vh] overflow-auto pr-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                Add owners and make sure shares sum to 100.
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={recalcOwnerShares}>
                  Auto-split shares
                </Button>
                <Popover open={ownerAddOpen} onOpenChange={setOwnerAddOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" size="sm" variant="outline" disabled={disabled}>
                      Add owner
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[420px] max-w-[calc(80vw-3rem)] p-0"
                    align="end"
                    portal={false}
                    onInteractOutside={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onFocusOutside={(e) => e.preventDefault()}
                  >
                    <Command shouldFilter={false}>
                      <div className="p-2 border-b flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={partyRegistryType === "all" ? "default" : "outline"}
                          onClick={() => setPartyRegistryType("all")}
                        >
                          All
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={partyRegistryType === "individual" ? "default" : "outline"}
                          onClick={() => setPartyRegistryType("individual")}
                        >
                          Individual
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={partyRegistryType === "organization" ? "default" : "outline"}
                          onClick={() => setPartyRegistryType("organization")}
                        >
                          Organization
                        </Button>
                      </div>
                      <CommandInput
                        placeholder="Search party name or NIDA..."
                        value={partyRegistrySearch}
                        onValueChange={setPartyRegistrySearch}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                      />
                      <CommandList onScroll={handlePartyRegistryScroll}>
                        <CommandEmpty>
                          {partyRegistryLoading ? "Loading..." : "No party found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {partyRegistry.map((p) => (
                            <CommandItem
                              key={p.id}
                              onSelect={() => {
                                dirtyRef.current.parties = true;
                                setParties((prev) => {
                                  if (prev.some((x) => x.party === p.id)) return prev;
                                  const ownerCount = prev.filter((x) => x.role === "owner" || x.role === "co_owner").length;
                                  const role = ownerCount === 0 ? "owner" : "co_owner";
                                  const next = [
                                    ...prev,
                                    {
                                      role,
                                      full_name: null,
                                      relationship: null,
                                      age_years: null,
                                      gender: null,
                                      citizenship: null,
                                      citizenship_ref: null,
                                      birth_certificate_ref: null,
                                      address: null,
                                      share_percentage: null,
                                      party: p.id,
                                    },
                                  ];
                                  return next;
                                });
                                setOwnerAddOpen(false);
                                window.setTimeout(() => recalcOwnerShares(), 0);
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <div className="text-sm">{p.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {p.party_type}
                                  {p.nida_number ? ` • ${p.nida_number}` : ""}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DataTable
              columns={ownerColumns}
              data={parties.filter((p) => p.role === "owner" || p.role === "co_owner")}
              shadowed={false}
              enableGlobalFilter={false}
              showPagination={false}
              emptyText="No owners added"
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
                            const shareRaw = prompt(
                              "Share %",
                              row.share_percentage == null ? "" : String(row.share_percentage)
                            );
                            const share = shareRaw == null || shareRaw === "" ? null : Number(shareRaw);
                            dirtyRef.current.parties = true;
                            setParties((prev) =>
                              prev.map((p, idx) =>
                                idx === i
                                  ? {
                                      ...p,
                                      share_percentage: share,
                                    }
                                  : p
                              )
                            );
                          }}
                        >
                          Edit share
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

          <TabsContent value="representative">
            <div className="max-h-[60vh] overflow-auto pr-1">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Optional. Select a representative if someone is acting on behalf of the owners.</div>

                <Popover open={repPickerOpen} onOpenChange={setRepPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" disabled={disabled}>
                      {parties.find((p) => p.role === "representative")?.party
                        ? partyLabelById.get(parties.find((p) => p.role === "representative")!.party as number) || "Change representative"
                        : "Select representative"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[420px] max-w-[calc(80vw-3rem)] p-0"
                    align="start"
                    portal={false}
                    onInteractOutside={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onFocusOutside={(e) => e.preventDefault()}
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search party name or NIDA..."
                        value={partyRegistrySearch}
                        onValueChange={setPartyRegistrySearch}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                      />
                      <CommandList onScroll={handlePartyRegistryScroll}>
                        <CommandEmpty>{partyRegistryLoading ? "Loading..." : "No party found."}</CommandEmpty>
                        <CommandGroup>
                          {partyRegistry.map((p) => (
                            <CommandItem
                              key={p.id}
                              onSelect={() => {
                                dirtyRef.current.parties = true;
                                setParties((prev) => {
                                  const idx = prev.findIndex((x) => x.role === "representative");
                                  if (idx >= 0) {
                                    const next = [...prev];
                                    next[idx] = { ...next[idx], party: p.id };
                                    return next;
                                  }
                                  return [
                                    ...prev,
                                    {
                                      role: "representative",
                                      party: p.id,
                                      relationship: null,
                                      age_years: null,
                                      gender: null,
                                      citizenship: null,
                                      citizenship_ref: null,
                                      birth_certificate_ref: null,
                                      address: null,
                                      share_percentage: null,
                                      full_name: null,
                                    },
                                  ];
                                });
                                setRepPickerOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <div className="text-sm">{p.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {p.party_type}
                                  {p.nida_number ? ` • ${p.nida_number}` : ""}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {disabled ? null : (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive justify-start px-0"
                    onClick={() => {
                      if (!confirm("Remove representative?") ) return;
                      dirtyRef.current.parties = true;
                      setParties((prev) => prev.filter((p) => p.role !== "representative"));
                    }}
                  >
                    Remove representative
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {isGroupOwnership(ownershipType) ? null : (
            <TabsContent value="family">
              <div className="max-h-[60vh] overflow-auto pr-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Optional. Add spouse and other family members.</div>
                  <Popover open={familyAddOpen} onOpenChange={setFamilyAddOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" size="sm" variant="outline" disabled={disabled}>
                        Add family member
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[420px] max-w-[calc(80vw-3rem)] p-0"
                      align="end"
                      portal={false}
                      onInteractOutside={(e) => e.preventDefault()}
                      onPointerDownOutside={(e) => e.preventDefault()}
                      onFocusOutside={(e) => e.preventDefault()}
                    >
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search party name or NIDA..."
                          value={partyRegistrySearch}
                          onValueChange={setPartyRegistrySearch}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                          }}
                        />
                        <CommandList onScroll={handlePartyRegistryScroll}>
                          <CommandEmpty>{partyRegistryLoading ? "Loading..." : "No party found."}</CommandEmpty>
                          <CommandGroup>
                            {partyRegistry.map((p) => (
                              <CommandItem
                                key={p.id}
                                onSelect={() => {
                                  dirtyRef.current.parties = true;
                                  setParties((prev) => {
                                    if (prev.some((x) => x.party === p.id)) return prev;
                                    return [
                                      ...prev,
                                      {
                                        role: "family_member",
                                        party: p.id,
                                        relationship: null,
                                        age_years: null,
                                        gender: null,
                                        citizenship: null,
                                        citizenship_ref: null,
                                        birth_certificate_ref: null,
                                        address: null,
                                        share_percentage: null,
                                        full_name: null,
                                      },
                                    ];
                                  });
                                  setFamilyAddOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <div className="text-sm">{p.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {p.party_type}
                                    {p.nida_number ? ` • ${p.nida_number}` : ""}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <DataTable
                  columns={familyColumns}
                  data={parties.filter((p) => p.role === "family_member" || p.role === "spouse")}
                  shadowed={false}
                  enableGlobalFilter={false}
                  showPagination={false}
                  emptyText="No family members added"
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
                                const role = prompt("Role (spouse/family_member)", row.role) || row.role;
                                const relationship = prompt("Relationship", row.relationship || "") ?? (row.relationship || "");
                                dirtyRef.current.parties = true;
                                setParties((prev) =>
                                  prev.map((p, idx) =>
                                    idx === i
                                      ? {
                                          ...p,
                                          role: role === "spouse" ? "spouse" : "family_member",
                                          relationship: relationship.trim() ? relationship.trim() : null,
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
                                if (!confirm("Remove this family member?") ) return;
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
          )}

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
