import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState, useEffect, useCallback } from "react";
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
  BarChart3,
  Eye,
  Filter,
  Search,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface FormResponse {
  id: string;
  formId: string;
  formName: string;
  respondent: string;
  location: string;
  answers: Record<string, string | number | boolean>;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface FormResponseState {
  responses: FormResponse[];
  filteredResponses: FormResponse[];
  selectedForm: string;
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  viewMode: "table" | "cards" | "analytics";
  loading: boolean;
}

export default function FormResponsesPage() {
  const { setPage } = usePageStore();
  const [state, setState] = useState<FormResponseState>({
    responses: [],
    filteredResponses: [],
    selectedForm: "",
    searchTerm: "",
    statusFilter: "",
    dateFilter: "",
    viewMode: "table",
    loading: true,
  });

  useLayoutEffect(() => {
    setPage({
      module: "system-settings",
      title: "Form Responses",
    });
  }, [setPage]);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      // TODO: Replace with actual API call
      const mockResponses: FormResponse[] = [
        {
          id: "R001",
          formId: "F001",
          formName: "Land Use Survey",
          respondent: "John Doe",
          location: "Kampala Central",
          answers: {
            "Land Owner Name": "John Doe",
            "Land Area": "2.5",
            "Land Use Type": "Residential",
          },
          submittedAt: "2024-02-20T10:30:00Z",
          status: "approved",
        },
        {
          id: "R002",
          formId: "F001",
          formName: "Land Use Survey",
          respondent: "Jane Smith",
          location: "Entebbe District",
          answers: {
            "Land Owner Name": "Jane Smith",
            "Land Area": "1.8",
            "Land Use Type": "Commercial",
          },
          submittedAt: "2024-02-21T14:15:00Z",
          status: "pending",
        },
        {
          id: "R003",
          formId: "F002",
          formName: "Party Information",
          respondent: "Mike Johnson",
          location: "Jinja Municipality",
          answers: {
            "Party Name": "Mike Johnson",
            "ID Number": "123456789",
            "Contact Number": "+256-701-234-567",
          },
          submittedAt: "2024-02-22T09:45:00Z",
          status: "rejected",
        },
      ];

      setState((prev) => ({
        ...prev,
        responses: mockResponses,
        filteredResponses: mockResponses,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading responses:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const filterResponses = useCallback(() => {
    let filtered = state.responses;

    // Search filter
    if (state.searchTerm) {
      filtered = filtered.filter(
        (response) =>
          response.respondent
            .toLowerCase()
            .includes(state.searchTerm.toLowerCase()) ||
          response.location
            .toLowerCase()
            .includes(state.searchTerm.toLowerCase()) ||
          response.formName
            .toLowerCase()
            .includes(state.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (state.statusFilter) {
      filtered = filtered.filter(
        (response) => response.status === state.statusFilter
      );
    }

    // Form filter
    if (state.selectedForm) {
      filtered = filtered.filter(
        (response) => response.formId === state.selectedForm
      );
    }

    setState((prev) => ({
      ...prev,
      filteredResponses: filtered,
    }));
  }, [state.responses, state.searchTerm, state.statusFilter, state.selectedForm]);

  useEffect(() => {
    filterResponses();
  }, [state.responses, state.searchTerm, state.statusFilter, state.dateFilter, state.selectedForm, filterResponses]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Form Responses</h1>
          <p className="text-muted-foreground">
            View and analyze form submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search responses..."
                value={state.searchTerm}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, searchTerm: e.target.value }))
                }
                className="pl-10"
              />
            </div>

            <Select
              value={state.statusFilter}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, statusFilter: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Status</SelectItem> */}
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={state.selectedForm}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, selectedForm: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Form" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Forms</SelectItem> */}
                <SelectItem value="F001">Land Use Survey</SelectItem>
                <SelectItem value="F002">Party Information</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={state.viewMode}
              onValueChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  viewMode: value as "table" | "cards" | "analytics",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="cards">Card View</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold">{state.responses.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">
                  {
                    state.responses.filter((r) => r.status === "approved")
                      .length
                  }
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {state.responses.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">
                  {
                    state.responses.filter((r) => r.status === "rejected")
                      .length
                  }
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responses Display */}
      <Card>
        <CardHeader>
          <CardTitle>Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {state.viewMode === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Respondent</th>
                    <th className="text-left p-2">Form</th>
                    <th className="text-left p-2">Location</th>
                    <th className="text-left p-2">Submitted</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.filteredResponses.map((response) => (
                    <tr key={response.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{response.respondent}</td>
                      <td className="p-2">{response.formName}</td>
                      <td className="p-2">{response.location}</td>
                      <td className="p-2">
                        {new Date(response.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(response.status)}
                          <Badge
                            variant={getStatusBadgeVariant(response.status)}
                          >
                            {response.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {state.viewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.filteredResponses.map((response) => (
                <Card
                  key={response.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {response.respondent}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(response.status)}
                        <Badge variant={getStatusBadgeVariant(response.status)}>
                          {response.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{response.formName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{response.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(response.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {state.viewMode === "analytics" && (
            <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Analytics Dashboard</p>
                <p className="text-sm text-gray-500">
                  Charts and analytics will be implemented here
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
