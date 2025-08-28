import { useState, useEffect, useLayoutEffect } from "react";
import { organizationService } from "@/services/organizations";
import { type OrganizationI } from "@/types/organizations";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { usePageStore } from "@/store/pageStore";
import { DataTable } from "@/components/DataTable";
import { ListOrganizationsColumns } from "@/lib/TableColumns/organizations.columns";
import ActionButtons from "@/components/ActionButtons";
import api from "@/lib/axios";

type SortField =
  | "name"
  | "type"
  | "region"
  | "status"
  | "members_count"
  | "projects_count";
type SortOrder = "asc" | "desc";

export default function OrganizationDirectory() {
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm] = useState("");
  const [sortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({
    field: "name",
    order: "asc",
  });
  const navigate = useNavigate();
  // set layout
  const { setPage } = usePageStore();
  useLayoutEffect(() => {
    setPage({
      module: "organizations",
      title: "Organizations-list",
      backButton: "Back to Modules",
    });
  }, [setPage]);
  // Load organizations
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const orgs = await organizationService.getOrganizations({
          search: searchTerm,
          sort: `${sortConfig.order === "desc" ? "-" : ""}${sortConfig.field}`,
        });
        console.log("Fetched organizations:", orgs);
        setOrganizations(orgs);
      } catch (error) {
        console.error("Error loading organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadData, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm, sortConfig]);

  // Sorting handler

  return (
    <div>
      {/* Organizations Table */}
      <div className="rounded-md border">
        <DataTable
          data={organizations}
          columns={ListOrganizationsColumns}
          isLoading={loading}
          showRowNumbers
          enableGlobalFilter
          searchPlaceholder="Search organizations..."
          onRowClick={(org) => navigate(`/organizations/${org.id}`)}
          rightToolbar={
            <Button onClick={() => navigate("registration")} className="gap-2">
              {/* your icon here */}
              Register Organization
            </Button>
          }
          rowActions={(row) => (
            <ActionButtons
              entity={row}
              entityName="Organization"
              onView={(e) => navigate(`/organizations/${(e as any).id}`)}
              onEdit={(e) => navigate(`/organizations/${(e as any).id}/edit`)}
              deleteFunction={(idOrEntity) =>
                api.organizations.delete(idOrEntity)
              }
            />
          )}
        />
      </div>
    </div>
  );
}
