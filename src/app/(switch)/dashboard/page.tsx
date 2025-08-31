import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectStats {
  total: number;
  approved: number;
  ongoing: number;
  active: number;
  expiry: number;
  funders: Array<{ name: string; count: number }>;
  toExpire: Array<{ project: string; expiryDate: string }>;
}

interface DashboardData {
  projectStats: ProjectStats;
  ccroCount: number;
  loading: boolean;
}

export default function DashboardPage() {
  const { setPage } = usePageStore();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    projectStats: {
      total: 0,
      approved: 0,
      ongoing: 0,
      active: 0,
      expiry: 0,
      funders: [],
      toExpire: [],
    },
    ccroCount: 0,
    loading: true,
  });
  const [selectedProjectType, setSelectedProjectType] = useState<string>("5");

  useLayoutEffect(() => {
    setPage({
      module: "dashboard",
      title: "Dashboard",
    });
  }, [setPage]);

  useEffect(() => {
    fetchProjectStats();
    fetchCcroStats();
  }, [selectedProjectType]);

  const fetchProjectStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await ProjectsService.fetchProjectStats()
      const mockData: ProjectStats = {
        total: 156,
        approved: 89,
        ongoing: 45,
        active: 134,
        expiry: 12,
        funders: [
          { name: "World Bank", count: 45 },
          { name: "USAID", count: 32 },
          { name: "EU", count: 28 },
          { name: "Local Government", count: 51 },
        ],
        toExpire: [
          {
            project: "Northern Region Land Use Plan",
            expiryDate: "2024-03-15",
          },
          { project: "Eastern District Planning", expiryDate: "2024-04-20" },
          { project: "Western Zone Development", expiryDate: "2024-05-10" },
        ],
      };

      setDashboardData((prev) => ({
        ...prev,
        projectStats: mockData,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching project stats:", error);
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchCcroStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await CollectService.fetchCcroCounter()
      const ccroCount = 2347;
      setDashboardData((prev) => ({
        ...prev,
        ccroCount,
      }));
    } catch (error) {
      console.error("Error fetching CCRO stats:", error);
    }
  };

  //   const getStatusColor = (type: string) => {
  //     switch (type) {
  //       case "total":
  //         return "bg-blue-500";
  //       case "approved":
  //         return "bg-green-500";
  //       case "ongoing":
  //         return "bg-yellow-500";
  //       case "active":
  //         return "bg-cyan-500";
  //       case "expiry":
  //         return "bg-red-500";
  //       default:
  //         return "bg-gray-500";
  //     }
  //   };

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Project Type Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Project Type:</label>
        <Select
          value={selectedProjectType}
          onValueChange={setSelectedProjectType}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Project Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">All Projects</SelectItem>
            <SelectItem value="1">Land Use Plans</SelectItem>
            <SelectItem value="2">Spatial Planning</SelectItem>
            <SelectItem value="3">Development Projects</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Land Use Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.projectStats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.projectStats.approved}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ongoing Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.projectStats.ongoing}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.projectStats.active}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired/Expiring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.projectStats.expiry}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CCRO Counter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.ccroCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Additional Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funders Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Projects by Funder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.projectStats.funders.map((funder, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{funder.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(funder.count /
                            Math.max(
                              ...dashboardData.projectStats.funders.map(
                                (f) => f.count
                              )
                            )) *
                            100
                            }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {funder.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.projectStats.toExpire.map((project, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{project.project}</p>
                    <p className="text-xs text-muted-foreground">
                      Expires:{" "}
                      {new Date(project.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="destructive">Expiring</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
