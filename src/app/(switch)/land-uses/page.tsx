import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectStats } from "@/queries/useProjectQuery";

export default function DashboardPage() {
  const { setPage } = usePageStore();
  const { data: projectStats, isLoading, error } = useProjectStats();

  useLayoutEffect(() => {
    setPage({
      module: "land-uses",
      title: "Dashboard",
      backButton: "Back to Modules",
    });
  }, [setPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive">Error Loading Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Failed to load project statistics. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // Mock data for funders and expiring projects (to be replaced with real data when available)
  const fundersData = [
    { name: "World Bank", count: 45 },
    { name: "USAID", count: 32 },
    { name: "EU", count: 28 },
    { name: "Local Government", count: 51 },
  ];

  const expiringProjects = [
    {
      project: "Northern Region Land Use Plan",
      expiryDate: "2024-03-15",
    },
    { project: "Eastern District Planning", expiryDate: "2024-04-20" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats?.total_projects || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats?.active_projects || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats?.completed_projects || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats?.draft_projects || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional dashboard content can be added here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Funders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fundersData.map((funder, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{funder.name}</span>
                  <Badge variant="secondary">{funder.count} projects</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expiring Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{project.project}</span>
                  <Badge variant="outline">{project.expiryDate}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
