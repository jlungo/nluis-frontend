'use client';

import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Download, Settings, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardDataQuery } from "@/queries/useDashboardDataQuery";
import { DashboardLoadingSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import {
  ParcelMetrics,
} from "@/components/dashboard/MetricsCards";
import {
  CCROTrendChart,
  ParcelZoneDistribution,
  FormSubmissionTrend,
  ParcelProgressChart,
  LocalityCoverageChart,
  UserActivityChart,
  DataQualityTrendChart,
  ProjectBudgetChart,
  SystemPerformanceChart,
} from "@/components/dashboard/Charts";
import { DashboardMapboxMap } from "@/components/dashboard/MapboxMap";
import { ProjectsComprehensive } from "@/components/dashboard/ProjectsComprehensive";
import { CCROComprehensive } from "@/components/dashboard/CCROComprehensive";

export default function DashboardPage() {
  const { setPage } = usePageStore();
  const { data: dashboardData, isLoading, error, refetch } = useDashboardDataQuery();

  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    setPage({
      module: "dashboard",
      title: "GRII Dashboard - System Overview",
    });
  }, [setPage]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading || !dashboardData) {
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Failed to load dashboard'}</p>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GRII Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Geographic Rights & Information Index - System Overview
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {dashboardData.dataCurrentness}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleManualRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Executive Summary</h2>
        <SummaryCards data={dashboardData} />
      </div>

      {/* Tabbed Interface for Detailed Metrics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ccro">CCRO</TabsTrigger>
          <TabsTrigger value="parcels">Parcels</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="zoning">Zoning</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subdivision Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subdivision Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Submitted</span>
                  <Badge variant="outline">{dashboardData.subdivision.submitted}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Under Review</span>
                  <Badge variant="outline">{dashboardData.subdivision.underReview}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Approved</span>
                  <Badge className="bg-green-100 text-green-800">
                    {dashboardData.subdivision.approved}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {dashboardData.subdivision.completed}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Avg Processing: {dashboardData.subdivision.avgProcessingDays} days
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Geographic Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Localities Covered</span>
                  <span className="font-semibold">{dashboardData.coverage.totalLocalitiesCovered}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cadastral Coverage</span>
                  <span className="font-semibold">{dashboardData.coverage.cadastralCoverage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Registration Rate</span>
                  <span className="font-semibold">{dashboardData.coverage.registrationRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">CCRO Issuance Rate</span>
                  <span className="font-semibold">{dashboardData.coverage.ccroissuanceRate}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Location Map */}
            <DashboardMapboxMap data={dashboardData} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CCROTrendChart data={dashboardData} />
            <FormSubmissionTrend data={dashboardData} />
          </div>

          {/* User Performance & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Surveyors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.surveyorPerformance.slice(0, 5).map((surveyor) => (
                    <div
                      key={surveyor.surveyorId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{surveyor.surveyorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {surveyor.parcelCount} parcels • Avg {surveyor.avgProcessingDays}d
                        </p>
                      </div>
                      {surveyor.qualityScore && (
                        <Badge className="bg-green-100 text-green-800">
                          {surveyor.qualityScore}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <UserActivityChart data={dashboardData} />
          </div>
        </TabsContent>

        {/* CCRO Tab */}
        <TabsContent value="ccro" className="space-y-6 mt-6">
          <CCROComprehensive data={dashboardData} ccroApplications={[]} />
        </TabsContent>

        {/* Parcels Tab */}
        <TabsContent value="parcels" className="space-y-6 mt-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParcelProgressChart data={dashboardData} />
            <ParcelZoneDistribution data={dashboardData} />
          </div>

          {/* Metrics Cards */}
          <ParcelMetrics data={dashboardData} />

          {/* Map */}
          <div className="grid grid-cols-1 gap-6">
            <DashboardMapboxMap data={dashboardData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Photo Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Photos</span>
                  <span className="font-semibold">{dashboardData.photo.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg per Parcel</span>
                  <span className="font-semibold">{dashboardData.photo.avgPerParcel}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t text-orange-600">
                  <span className="text-sm">Missing Photos</span>
                  <span className="font-semibold">{dashboardData.photo.missingPhotos}</span>
                </div>
              </CardContent>
            </Card>

            {/* Parcel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Land Use Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(dashboardData.parcel.byZone)
                  .slice(0, 4)
                  .map(([zone, count]) => (
                    <div key={zone} className="flex justify-between items-center text-sm">
                      <span>{zone}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Zoning Tab */}
        <TabsContent value="zoning" className="space-y-6 mt-6">
          {/* Chart */}
          <div className="grid grid-cols-1 gap-6">
            {/* Placeholder for Zoning Map - would go here */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Zoning Plans Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center text-muted-foreground">
                  Interactive zoning map visualization
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.zoning.totalPlans}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.zoning.byStatus.approved}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {dashboardData.zoning.byStatus.inReview}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Draft</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.zoning.byStatus.draft}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zone Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-sm text-muted-foreground">Polygons</p>
                  <p className="text-2xl font-bold">{dashboardData.zone.byType.polygon}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-sm text-muted-foreground">Lines</p>
                  <p className="text-2xl font-bold">{dashboardData.zone.byType.line}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="text-2xl font-bold">{dashboardData.zone.byType.point}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6 mt-6">
          <ProjectsComprehensive data={dashboardData} projects={[]} />
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6 mt-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataQualityTrendChart data={dashboardData} />
            <SystemPerformanceChart data={dashboardData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LocalityCoverageChart data={dashboardData} />
            <ProjectBudgetChart data={dashboardData} />
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {dashboardData.dataQuality.qualityScore}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {dashboardData.dataQuality.completeness}% complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {dashboardData.compliance.complianceScore}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {dashboardData.compliance.auditTrailCompleteness}% audit complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Operational Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {dashboardData.efficiency.systemUptime}%
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  System uptime
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Quality Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Spatial Conflicts</span>
                <Badge variant="outline">{dashboardData.dataQuality.spatialConflicts}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Missing NIDA</span>
                <Badge variant="outline">{dashboardData.dataQuality.missingNida}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Geometry Issues</span>
                <Badge variant="outline">{dashboardData.dataQuality.geometryIssues}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Duplicates</span>
                <Badge variant="outline">{dashboardData.dataQuality.duplicates}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
