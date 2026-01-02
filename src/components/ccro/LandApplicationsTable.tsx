import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/axios";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LandApplicationModal from "@/components/ccro/LandApplicationModal";

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
  projectId?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

export default function LandApplicationsTable(props: Props) {
  const { mode, scope, localityProjectId, disabled, onValueChange } = props;
  const [items, setItems] = useState<LandApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onValueChangeRef = useRef<Props["onValueChange"]>(onValueChange);
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeApplicationId, setActiveApplicationId] = useState<number | undefined>(undefined);

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
              disabled={disabled}
              onClick={() => {
                setActiveApplicationId(row.id);
                setModalOpen(true);
              }}
            >
              Edit
            </Button>
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
            disabled={disabled}
            onClick={() => {
              setActiveApplicationId(row.id);
              setModalOpen(true);
            }}
          >
            View
          </Button>
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
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setActiveApplicationId(undefined);
            setModalOpen(true);
          }}
          disabled={isLoading}
        >
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

      {scope === "project" && localityProjectId ? (
        <LandApplicationModal
          open={modalOpen}
          onOpenChange={(o) => setModalOpen(o)}
          localityProjectId={localityProjectId}
          projectId={props.projectId || ""}
          applicationId={activeApplicationId}
          disabled={disabled}
          onSaved={async () => {
            await load();
          }}
        />
      ) : null}
    </div>
  );
}
