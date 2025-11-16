import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import api from "@/lib/axios";
import { usePageStore } from "@/store/pageStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PlanVersionMap from "@/components/zoning/map/PlanVersionMap";
import { toast } from "sonner";

interface LandUsePlanDto {
  id: number;
  name: string;
  locality: number;
  effective_from: string;
  effective_to: string | null;
  description: string | null;
}

interface PlanVersionDto {
  id: number;
  plan: number;
  plan_name: string;
  version_number: number;
  notes: string | null;
  feature_count: number;
  geom_hash: string | null;
  artifact_file: string | null;
  finalized_at: string | null;
}

export default function LandUsePlanDetailPage() {
  const { plan_id } = useParams();
  const { setPage } = usePageStore();
  const [plan, setPlan] = useState<LandUsePlanDto | null>(null);
  const [versions, setVersions] = useState<PlanVersionDto[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  useEffect(() => {
    setPage({ module: "land-uses", title: "Land use Plan" });
  }, [setPage]);

  useEffect(() => {
    const id = Number(plan_id);
    if (!id) return;

    const fetchPlan = async () => {
      try {
        const res = await api.get(`/zoning/plans/${id}/`);
        setPlan(res.data);
      } catch (e) {
        console.error("Failed to load plan", e);
      }
    };

    const fetchVersions = async () => {
      try {
        const res = await api.get(`/zoning/plans/${id}/versions/`);
        const list = res.data as PlanVersionDto[];
        setVersions(list);
        if (list.length && !selectedVersionId) {
          setSelectedVersionId(list[0].id);
        }
      } catch (e) {
        console.error("Failed to load versions", e);
      }
    };

    fetchPlan();
    fetchVersions();
  }, [plan_id, selectedVersionId]);

  const activeVersion = useMemo(
    () => versions.find((v) => v.id === selectedVersionId) || null,
    [versions, selectedVersionId]
  );

  const onFinalize = async () => {
    if (!plan) return;
    try {
      const res = await api.post(`/zoning/plans/${plan.id}/finalize/`, {
        notes: "",
        dissolve_by_land_use: false,
      });
      const created = res.data?.version as PlanVersionDto;
      if (created) {
        setVersions((prev) => [created, ...prev]);
        setSelectedVersionId(created.id);
        toast.success(`Version ${created.version_number} created successfully!`);
      }
    } catch (e: any) {
      console.error("Finalize failed", e);
      
      // Check for specific error messages from the backend
      const errorMessage = e?.response?.data?.detail || e?.response?.data?.message;
      
      if (errorMessage) {
        toast.error(errorMessage);
      } else if (e?.response?.status === 400) {
        toast.error("Cannot finalize plan. Please check the plan configuration.");
      } else {
        toast.error("Failed to finalize plan. Please try again.");
      }
    }
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">
              {plan ? plan.name : "Land use Plan"}
            </CardTitle>
            {plan && (
              <div className="mt-1 text-xs text-muted-foreground">
                Locality ID: {plan.locality} • Effective {plan.effective_from}
                {plan.effective_to ? ` - ${plan.effective_to}` : " (ongoing)"}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onFinalize} disabled={!plan}>
              Finalize from current zoning
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan?.description && (
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {plan.description}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium">Versions</div>
            {versions.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                No versions yet. Use "Finalize from current zoning" to create the first version.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {versions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`px-3 py-1 rounded-full text-xs border ${
                      v.id === selectedVersionId
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border"
                    }`}
                    onClick={() => setSelectedVersionId(v.id)}
                  >
                    v{v.version_number} {v.notes ? `- ${v.notes}` : ""}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeVersion && (
            <div className="text-xs text-muted-foreground">
              Finalized at: {activeVersion.finalized_at || "n/a"} • Features: {" "}
              {activeVersion.feature_count ?? 0}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-[480px]">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Plan map</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] p-0">
          {plan && activeVersion ? (
            activeVersion.feature_count > 0 ? (
              <PlanVersionMap 
                planId={plan.id} 
                versionId={activeVersion.id} 
                localityId={plan.locality}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                <div className="text-center">
                  <p>No features in this version</p>
                  <p className="text-xs mt-1">
                    This version has 0 zones. Zones need to be approved before finalizing.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Select a version to view its map.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
