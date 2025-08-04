import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Table,
  Calendar,
  Map,
  Users,
  Building,
  TrendingUp,
  Eye,
  Share2,
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  type:
    | "land-use"
    | "ccro"
    | "compliance"
    | "spatial"
    | "demographic"
    | "financial";
  description: string;
  status: "draft" | "generated" | "published";
  createdAt: string;
  updatedAt: string;
  data: any[];
  filters: ReportFilters;
}

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  region: string;
  district: string;
  council: string;
  ward: string;
  village: string;
  status: string;
  type: string;
}

interface ReportState {
  reports: Report[];
  selectedReport: Report | null;
  filters: ReportFilters;
  loading: boolean;
  generating: boolean;
  viewMode: "table" | "chart" | "map";
  chartType: "bar" | "pie" | "line";
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
}

export default function ReportsPage() {
  const { setPage } = usePageStore();
  const [state, setState] = useState<ReportState>({
    reports: [],
    selectedReport: null,
    filters: {
      dateFrom: "",
      dateTo: "",
      region: "",
      district: "",
      council: "",
      ward: "",
      village: "",
      status: "",
      type: "",
    },
    loading: true,
    generating: false,
    viewMode: "table",
    chartType: "bar",
    searchTerm: "",
    statusFilter: "",
    typeFilter: "",
  });

  useLayoutEffect(() => {
    setPage({
      module: "reports",
      title: "Reports & Analytics",
      backButton: "Back to Dashboard",
    });
  }, [setPage]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockReports: Report[] = [
        {
          id: "1",
          name: "Land Use Summary Report",
          type: "land-use",
          description:
            "Comprehensive overview of land use patterns and changes",
          status: "generated",
          createdAt: "2024-01-15",
          updatedAt: "2024-02-20",
          data: [],
          filters: {
            dateFrom: "2024-01-01",
            dateTo: "2024-02-20",
            region: "Dar es Salaam",
            district: "",
            council: "",
            ward: "",
            village: "",
            status: "",
            type: "",
          },
        },
        {
          id: "2",
          name: "CCRO Registration Report",
          type: "ccro",
          description:
            "Certificate of Customary Right of Occupancy registrations",
          status: "published",
          createdAt: "2024-01-10",
          updatedAt: "2024-02-15",
          data: [],
          filters: {
            dateFrom: "2024-01-01",
            dateTo: "2024-02-15",
            region: "",
            district: "",
            council: "",
            ward: "",
            village: "",
            status: "approved",
            type: "",
          },
        },
        {
          id: "3",
          name: "Compliance Monitoring Report",
          type: "compliance",
          description: "Land use compliance and enforcement activities",
          status: "draft",
          createdAt: "2024-02-18",
          updatedAt: "2024-02-18",
          data: [],
          filters: {
            dateFrom: "2024-01-01",
            dateTo: "2024-02-18",
            region: "",
            district: "",
            council: "",
            ward: "",
            village: "",
            status: "",
            type: "",
          },
        },
      ];

      setState((prev) => ({
        ...prev,
        reports: mockReports,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading reports:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleGenerateReport = async () => {
    if (!state.selectedReport) return;

    setState((prev) => ({ ...prev, generating: true }));

    try {
      // TODO: Implement actual report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setState((prev) => ({
        ...prev,
        generating: false,
        reports: prev.reports.map((report) =>
          report.id === state.selectedReport?.id
            ? { ...report, status: "generated" as const }
            : report
        ),
      }));
    } catch (error) {
      console.error("Error generating report:", error);
      setState((prev) => ({ ...prev, generating: false }));
    }
  };

  const handleExportReport = (
    reportId: string,
    format: "pdf" | "excel" | "csv"
  ) => {
    // TODO: Implement export functionality
    console.log(`Exporting report ${reportId} as ${format}`);
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value,
      },
    }));
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "land-use":
        return <Map className="h-4 w-4" />;
      case "ccro":
        return <FileText className="h-4 w-4" />;
      case "compliance":
        return <TrendingUp className="h-4 w-4" />;
      case "spatial":
        return <Map className="h-4 w-4" />;
      case "demographic":
        return <Users className="h-4 w-4" />;
      case "financial":
        return <Building className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "generated":
        return <Badge variant="default">Generated</Badge>;
      case "published":
        return <Badge variant="default">Published</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and manage comprehensive land use reports
          </p>
        </div>
        <Button
          onClick={() =>
            setState((prev) => ({ ...prev, selectedReport: null }))
          }
        >
          <FileText className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={state.searchTerm}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, searchTerm: e.target.value }))
                }
                className="pl-10"
              />
            </div>
            <Select
              value={state.typeFilter}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, typeFilter: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="land-use">Land Use</SelectItem>
                <SelectItem value="ccro">CCRO</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="spatial">Spatial</SelectItem>
                <SelectItem value="demographic">Demographic</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={state.statusFilter}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, statusFilter: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="From"
                value={state.filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
              <Input
                type="date"
                placeholder="To"
                value={state.filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.reports.map((report) => (
                  <Card
                    key={report.id}
                    className={`cursor-pointer transition-colors ${
                      state.selectedReport?.id === report.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() =>
                      setState((prev) => ({ ...prev, selectedReport: report }))
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getReportTypeIcon(report.type)}
                          <div>
                            <h4 className="font-medium">{report.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {report.description}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          Updated{" "}
                          {new Date(report.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Details */}
        <div className="lg:col-span-2">
          {state.selectedReport ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getReportTypeIcon(state.selectedReport.type)}
                    <CardTitle>{state.selectedReport.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(state.selectedReport.status)}
                    <Button
                      onClick={handleGenerateReport}
                      disabled={state.generating}
                      size="sm"
                    >
                      {state.generating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <BarChart3 className="h-4 w-4 mr-2" />
                      )}
                      Generate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {state.selectedReport.description}
                  </p>

                  {/* Report Filters */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium">Region</label>
                      <Input
                        value={state.selectedReport.filters.region}
                        onChange={(e) =>
                          handleFilterChange("region", e.target.value)
                        }
                        placeholder="All regions"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">District</label>
                      <Input
                        value={state.selectedReport.filters.district}
                        onChange={(e) =>
                          handleFilterChange("district", e.target.value)
                        }
                        placeholder="All districts"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Council</label>
                      <Input
                        value={state.selectedReport.filters.council}
                        onChange={(e) =>
                          handleFilterChange("council", e.target.value)
                        }
                        placeholder="All councils"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ward</label>
                      <Input
                        value={state.selectedReport.filters.ward}
                        onChange={(e) =>
                          handleFilterChange("ward", e.target.value)
                        }
                        placeholder="All wards"
                      />
                    </div>
                  </div>

                  {/* View Options */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">View:</span>
                      <Button
                        variant={
                          state.viewMode === "table" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setState((prev) => ({ ...prev, viewMode: "table" }))
                        }
                      >
                        <Table className="h-4 w-4 mr-1" />
                        Table
                      </Button>
                      <Button
                        variant={
                          state.viewMode === "chart" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setState((prev) => ({ ...prev, viewMode: "chart" }))
                        }
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Chart
                      </Button>
                      <Button
                        variant={
                          state.viewMode === "map" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setState((prev) => ({ ...prev, viewMode: "map" }))
                        }
                      >
                        <Map className="h-4 w-4 mr-1" />
                        Map
                      </Button>
                    </div>
                  </div>

                  {/* Report Content Placeholder */}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">Report Content</p>
                    <p className="text-sm text-muted-foreground">
                      {state.viewMode === "table" &&
                        "Table view will display report data in tabular format"}
                      {state.viewMode === "chart" &&
                        "Chart view will display data visualizations"}
                      {state.viewMode === "map" &&
                        "Map view will display spatial data and analytics"}
                    </p>
                  </div>

                  {/* Export Options */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Export:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleExportReport(state.selectedReport!.id, "pdf")
                      }
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleExportReport(state.selectedReport!.id, "excel")
                      }
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleExportReport(state.selectedReport!.id, "csv")
                      }
                    >
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a report to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
