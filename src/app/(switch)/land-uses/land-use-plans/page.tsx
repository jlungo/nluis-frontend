import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { usePageStore } from "@/store/pageStore";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocalitiesQuery } from "@/queries/useLocalityQuery";
import { tanzaniaLocalityKey, LOCALITY_LEVELS } from "@/types/constants";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader as DialogHeaderUI, DialogTitle as DialogTitleUI, DialogTrigger } from "@/components/ui/dialog";
import DatePicker from "@/components/form-field/form-date-picker";
import { toast } from "sonner";

interface LandUsePlanDto {
  id: number;
  name: string;
  locality: number;
  locality_name?: string;
  locality_level?: string;
  effective_from: string;
  effective_to: string | null;
  description: string | null;
}

interface LocalityOption {
  id: string;
  name: string;
  level?: string;
  parent?: string;
}

// Helper to format Date to YYYY-MM-DD in local timezone
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function LandUsePlansPage() {
  const { setPage } = usePageStore();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<LandUsePlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [planName, setPlanName] = useState<string>("");
  const [effectiveFrom, setEffectiveFrom] = useState<string>("");
  const [effectiveTo, setEffectiveTo] = useState<string>("");
  const [planDescription, setPlanDescription] = useState<string>("");

  // Root localities (e.g. regions of Tanzania)
  const { data: localityData, isLoading: loadingLocalities } = useLocalitiesQuery(tanzaniaLocalityKey);
  // Tree state (copied from project locality picker, but single-select)
  const [treeData, setTreeData] = useState<LocalityOption[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [pendingNodeId, setPendingNodeId] = useState<string | null>(null);
  const { data: childLocalities, isLoading: isLoadingChildren } = useLocalitiesQuery(
    pendingNodeId ? parseInt(pendingNodeId) : 0
  );

  useEffect(() => {
    setPage({ module: "land-uses", title: "Land use Plans" });
  }, [setPage]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedLevel !== "all") {
          params.set("locality_level", selectedLevel);
        }
        const url = params.toString()
          ? `/zoning/plans/?${params.toString()}`
          : "/zoning/plans/";
        const res = await api.get(url);
        setPlans(res.data || []);
      } catch (e) {
        console.error("Failed to load plans", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [selectedLevel]);

  // Initialize tree with root localities
  useEffect(() => {
    if (localityData) {
      setTreeData(localityData as LocalityOption[]);
    }
  }, [localityData]);

  // When child localities load for a pending node, append them into tree
  useEffect(() => {
    if (pendingNodeId && childLocalities && childLocalities.length > 0) {
      setTreeData((prev) => [...prev, ...(childLocalities as LocalityOption[])]);
      setPendingNodeId(null);
    }
  }, [childLocalities, pendingNodeId]);

  const hasChildren = (locality: LocalityOption) => {
    const level = parseInt(locality.level || "0");
    const targetLevel = parseInt(LOCALITY_LEVELS.VILLAGE);
    return level < targetLevel;
  };

  const getChildren = (parentId: string) => {
    return treeData.filter((item) => item.parent == parentId);
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);

    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
      setExpandedNodes(newExpanded);
    } else {
      newExpanded.add(nodeId);
      setExpandedNodes(newExpanded);

      const alreadyLoaded = treeData.some((item) => item.parent === nodeId);
      if (!alreadyLoaded) {
        setPendingNodeId(nodeId);
      }
    }
  };

  const isLocalitySelectable = (_locality: LocalityOption) => {
    // For plans we allow selecting any level (national/region/district/ward/village)
    return true;
  };

  const renderTreeNode = (node: LocalityOption) => {
    const children = getChildren(node.id);
    const isExpanded = expandedNodes.has(node.id);
    const selectable = isLocalitySelectable(node);
    const nodeHasChildren = hasChildren(node);
    const isLoading = pendingNodeId === node.id && isLoadingChildren;

    return (
      <div key={node.id}>
        <div className="flex items-center py-1">
          {nodeHasChildren ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mr-1"
              onClick={() => toggleNode(node.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6 mr-1" />
          )}

          {selectable ? (
            <button
              type="button"
              className={`flex-1 text-left text-sm ${
                selectedLocalityId === node.id ? "font-semibold" : ""
              }`}
              onClick={() => setSelectedLocalityId(node.id)}
              disabled={isLoading}
            >
              {node.name}
            </button>
          ) : (
            <div
              className="flex-1 py-1 text-sm font-medium cursor-pointer"
              onClick={() => nodeHasChildren && !isLoading && toggleNode(node.id)}
            >
              {node.name}
            </div>
          )}
        </div>

        {isExpanded && children.length > 0 && (
          <div className="border-l ml-3 pl-2">
            {children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const onDeletePlan = async (plan: LandUsePlanDto) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/zoning/plans/${plan.id}/`);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      toast.success(`Plan "${plan.name}" deleted successfully!`);
    } catch (e: any) {
      console.error("Failed to delete plan", e);
      const errorMessage = e?.response?.data?.detail || e?.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to delete plan. Please try again.");
      }
    }
  };

  const onCreatePlan = async () => {
    if (!selectedLocalityId) return;
    try {
      const localityId = selectedLocalityId;
      const locality = treeData.find((l) => l.id === localityId);
      const name = planName || (locality ? `Land Use Plan - ${locality.name}` : "Land Use Plan");

      const payload = {
        name,
        locality: localityId,
        effective_from: effectiveFrom || undefined,
        effective_to: effectiveTo || undefined,
        description: planDescription || undefined,
      };
      
      console.log('Creating plan with payload:', payload);
      const planRes = await api.post("/zoning/plans/", payload);

      const plan = planRes.data as LandUsePlanDto;

      setCreateOpen(false);
      setSelectedLocalityId("");
      setPlanName("");
      setEffectiveFrom("");
      setEffectiveTo("");
      setPlanDescription("");
      setPlans((prev) => [plan, ...prev]);
      navigate(`/land-uses/land-use-plans/${plan.id}`);
    } catch (e) {
      console.error("Failed to create plan", e);
    }
  };

  const columns: ColumnDef<LandUsePlanDto>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "locality_name",
        header: "Locality",
        cell: ({ row }) => row.original.locality_name ?? row.original.locality,
      },
      {
        accessorKey: "locality_level",
        header: "Level",
        cell: ({ row }) => row.original.locality_level ?? "",
      },
      {
        accessorKey: "effective_from",
        header: "Effective from",
        cell: ({ row }) => row.original.effective_from,
      },
      {
        accessorKey: "effective_to",
        header: "Effective to",
        cell: ({ row }) => row.original.effective_to ?? "",
      },
    ],
    []
  );

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Land use Plans</CardTitle>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeaderUI>
                <DialogTitleUI>Create Land use Plan</DialogTitleUI>
              </DialogHeaderUI>
              <div className="space-y-4">
                {/* Plan details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium" htmlFor="plan-name">
                        Plan name
                      </label>
                      <Input
                        id="plan-name"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="e.g. VLUP 2025 - Village A"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DatePicker
                        name="effective_from"
                        label="Effective from"
                        fullWidth
                        placeholder="Start date"
                        dateValue={effectiveFrom ? new Date(effectiveFrom) : undefined}
                        onDateChange={(d) => {
                          if (!d) return;
                          const formatted = formatDateLocal(d);
                          console.log('Selected effective_from:', formatted);
                          setEffectiveFrom(formatted);
                        }}
                      />
                      <DatePicker
                        name="effective_to"
                        label="Effective to"
                        fullWidth
                        placeholder="End date"
                        dateValue={effectiveTo ? new Date(effectiveTo) : undefined}
                        onDateChange={(d) => {
                          if (!d) return;
                          const formatted = formatDateLocal(d);
                          console.log('Selected effective_to:', formatted);
                          setEffectiveTo(formatted);
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium" htmlFor="plan-description">
                      Description
                    </label>
                    <Textarea
                      id="plan-description"
                      rows={3}
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      placeholder="Short description of this land use plan"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-medium">Select locality</div>
                  {loadingLocalities ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Spinner className="h-4 w-4" /> Loading localities...
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {/* Left: tree view */}
                      <div className="w-1/2 border rounded-md p-2 max-h-80 overflow-y-auto">
                        <h3 className="font-medium mb-2 text-sm">Localities</h3>
                        {treeData
                          .filter((item) => item.parent == `${tanzaniaLocalityKey}`)
                          .map((node) => renderTreeNode(node))}
                      </div>

                      {/* Right: selected locality */}
                      <div className="w-1/2 border rounded-md p-2 max-h-80 overflow-y-auto">
                        <h3 className="font-medium mb-2 text-sm">Selected locality</h3>
                        {!selectedLocalityId ? (
                          <p className="text-sm text-muted-foreground">
                            No locality selected yet.
                          </p>
                        ) : (
                          <div className="flex items-center justify-between p-2 border rounded-md">
                            <span className="text-sm">
                              {treeData.find((l) => l.id === selectedLocalityId)?.name ??
                                selectedLocalityId}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setSelectedLocalityId("")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={onCreatePlan} disabled={!selectedLocalityId}>
                    Create &amp; Finalize
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={plans}
            isLoading={loading}
            showRowNumbers
            rowActions={(plan) => (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/land-uses/land-use-plans/${plan.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePlan(plan);
                  }}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            onRowClick={(plan) =>
              navigate(`/land-uses/land-use-plans/${plan.id}`)
            }
            searchPlaceholder="Search plans..."
            rightToolbar={
              <div className="w-56">
                <Select
                  value={selectedLevel}
                  onValueChange={setSelectedLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by locality level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="village">Village</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="zonal">Zonal</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
            emptyText="No plans found."
          />
        </CardContent>
      </Card>

    </div>
  );
}
