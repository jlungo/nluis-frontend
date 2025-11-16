import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, FileText } from "lucide-react";
import { useModulesQuery } from "@/queries/useModuleQuery";
import { Spinner } from "@/components/ui/spinner";
import {
  useReportTemplatesQuery,
  useDeleteReportTemplateMutation,
  type ReportTemplateProps,
} from "@/queries/useReportTemplateQuery";
import { Link, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/DataTable";
import ActionButtons from "@/components/ActionButtons";
import { Columns } from "./columns";
import { toast } from "sonner";

export default function Page() {
  const { setPage: PageData } = usePageStore();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  useLayoutEffect(() => {
    PageData({
      module: "system-settings",
      title: "Report Template Management",
    });
  }, [PageData]);

  const { mutateAsync: deleteTemplate } = useDeleteReportTemplateMutation();
  const { data: modules, isLoading: isLoadingModules } = useModulesQuery();
  
  const { data: templates, isLoading: isLoadingTemplates } = useReportTemplatesQuery({
    module: filterModule || undefined,
    is_active: filterStatus === "" ? undefined : filterStatus === "active",
    search: keyword || undefined,
  });

  const handleDelete = async (slug: string) => {
    try {
      await deleteTemplate(slug);
      toast.success("Report template deleted successfully");
    } catch (error) {
      toast.error("Failed to delete report template");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Report Template Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage report templates for automatic document generation
          </p>
        </div>
        <Link
          to="/system-settings/form-management/reports/template-builder"
          className={cn(buttonVariants({ size: "sm" }), "gap-2")}
        >
          <Plus className="h-4 w-4" />
          Create<span className="hidden sm:inline"> Template</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Module Filter */}
            <div className="w-full md:w-1/3">
              <Select
                value={filterModule}
                onValueChange={(value) =>
                  setFilterModule(value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  {modules && modules.length > 0 ? (
                    <>
                      <SelectItem value="all">All Modules</SelectItem>
                      {modules.map((module) => (
                        <SelectItem key={module.slug} value={module.slug}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </>
                  ) : (
                    <div className="h-24 flex items-center justify-center">
                      {isLoadingModules ? (
                        <Spinner />
                      ) : (
                        <p className="text-muted-foreground text-sm text-center">
                          No modules found!
                        </p>
                      )}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-1/4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DataTable */}
      <DataTable<ReportTemplateProps, unknown>
        columns={Columns}
        data={templates || []}
        isLoading={isLoadingTemplates}
        showRowNumbers
        enableGlobalFilter={false}
        onRowClick={(template) =>
          navigate(`/system-settings/form-management/reports/${template.slug}`)
        }
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        rowActions={(row) => (
          <ActionButtons
            entity={row}
            entityName="Report Template"
            onView={(template) =>
              navigate(`/system-settings/form-management/reports/${template.slug}`)
            }
            onEdit={(template) =>
              navigate(
                `/system-settings/form-management/reports/${template.slug}/edit`
              )
            }
            deleteFunction={() => handleDelete(row.slug)}
          />
        )}
      />
    </div>
  );
}
