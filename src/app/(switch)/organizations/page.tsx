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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building,
  Users,
  MapPin,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Target,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  type:
    | "village-lu"
    | "district-lu"
    | "regional-lu"
    | "zonal-lu"
    | "national-lu"
    | "ccro"
    | "management";
  status: "draft" | "active" | "completed" | "suspended";
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  region: string;
  district: string;
  village: string;
  manager: string;
  teamSize: number;
  stakeholders: number;
}

interface ProjectState {
  projects: Project[];
  selectedProjects: string[];
  loading: boolean;
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  regionFilter: string;
  viewMode: "list" | "grid" | "kanban";
  showAddProject: boolean;
  editingProject: Project | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export default function OrganizationsPage() {
  const { setPage } = usePageStore();
  const [state, setState] = useState<ProjectState>({
    projects: [],
    selectedProjects: [],
    loading: true,
    searchTerm: "",
    statusFilter: "",
    typeFilter: "",
    regionFilter: "",
    viewMode: "list",
    showAddProject: false,
    editingProject: null,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  useLayoutEffect(() => {
    setPage({
      module: "organizations",
      title: "Project Management",
      backButton: "Back to Dashboard",
    });
  }, [setPage]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockProjects: Project[] = [
        {
          id: "1",
          name: "Village Land Use Planning - Mwanza",
          type: "village-lu",
          status: "active",
          description: "Comprehensive land use planning for Mwanza village",
          startDate: "2024-01-15",
          endDate: "2024-06-30",
          budget: 50000000,
          spent: 25000000,
          progress: 65,
          region: "Mwanza",
          district: "Ilemela",
          village: "Mwanza",
          manager: "John Mwita",
          teamSize: 8,
          stakeholders: 45,
        },
        {
          id: "2",
          name: "District Land Use Strategy - Dar es Salaam",
          type: "district-lu",
          status: "completed",
          description: "Strategic land use planning for Dar es Salaam district",
          startDate: "2023-07-01",
          endDate: "2024-01-31",
          budget: 75000000,
          spent: 75000000,
          progress: 100,
          region: "Dar es Salaam",
          district: "Ilala",
          village: "Dar es Salaam",
          manager: "Sarah Kimambo",
          teamSize: 12,
          stakeholders: 120,
        },
        {
          id: "3",
          name: "CCRO Registration Program - Arusha",
          type: "ccro",
          status: "active",
          description:
            "Certificate of Customary Right of Occupancy registration",
          startDate: "2024-02-01",
          endDate: "2024-12-31",
          budget: 30000000,
          spent: 8000000,
          progress: 35,
          region: "Arusha",
          district: "Arusha",
          village: "Arusha",
          manager: "Michael Nyerere",
          teamSize: 6,
          stakeholders: 85,
        },
        {
          id: "4",
          name: "Regional Land Use Assessment - Kilimanjaro",
          type: "regional-lu",
          status: "draft",
          description: "Regional land use assessment and planning",
          startDate: "2024-03-01",
          endDate: "2024-08-31",
          budget: 40000000,
          spent: 0,
          progress: 0,
          region: "Kilimanjaro",
          district: "Moshi",
          village: "Moshi",
          manager: "Grace Mwambene",
          teamSize: 10,
          stakeholders: 95,
        },
      ];

      setState((prev) => ({
        ...prev,
        projects: mockProjects,
        loading: false,
        totalPages: Math.ceil(mockProjects.length / prev.pageSize),
      }));
    } catch (error) {
      console.error("Error loading projects:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleProjectSelection = (projectId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedProjects.includes(projectId);
      const newSelected = isSelected
        ? prev.selectedProjects.filter((id) => id !== projectId)
        : [...prev.selectedProjects, projectId];

      return {
        ...prev,
        selectedProjects: newSelected,
      };
    });
  };

  const handleAddProject = () => {
    setState((prev) => ({ ...prev, showAddProject: true }));
  };

  const handleEditProject = (project: Project) => {
    setState((prev) => ({ ...prev, editingProject: project }));
  };

  const handleDeleteProject = (projectId: string) => {
    // TODO: Implement delete functionality
    console.log("Deleting project:", projectId);
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case "village-lu":
        return <MapPin className="h-4 w-4" />;
      case "district-lu":
        return <Building className="h-4 w-4" />;
      case "regional-lu":
        return <Target className="h-4 w-4" />;
      case "zonal-lu":
        return <TrendingUp className="h-4 w-4" />;
      case "national-lu":
        return <Building className="h-4 w-4" />;
      case "ccro":
        return <FileText className="h-4 w-4" />;
      case "management":
        return <Users className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "suspended":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount);
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
          <h1 className="text-2xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">
            Manage land use planning projects and organizational activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                viewMode: prev.viewMode === "list" ? "grid" : "list",
              }))
            }
          >
            {state.viewMode === "list" ? "Grid View" : "List View"}
          </Button>
          <Button onClick={handleAddProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Project Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
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
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Status</SelectItem> */}
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={state.typeFilter}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, typeFilter: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Types</SelectItem> */}
                <SelectItem value="village-lu">Village Land Use</SelectItem>
                <SelectItem value="district-lu">District Land Use</SelectItem>
                <SelectItem value="regional-lu">Regional Land Use</SelectItem>
                <SelectItem value="zonal-lu">Zonal Land Use</SelectItem>
                <SelectItem value="national-lu">National Land Use</SelectItem>
                <SelectItem value="ccro">CCRO</SelectItem>
                <SelectItem value="management">Management</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by region"
              value={state.regionFilter}
              onChange={(e) =>
                setState((prev) => ({ ...prev, regionFilter: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{state.projects.length}</p>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">
                  {state.projects.filter((p) => p.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    state.projects.reduce((sum, p) => sum + p.budget, 0)
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    state.projects.reduce((sum, p) => sum + p.progress, 0) /
                      state.projects.length
                  )}
                  %
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      {state.viewMode === "list" ? (
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <Checkbox
                        checked={
                          state.selectedProjects.length ===
                          state.projects.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setState((prev) => ({
                              ...prev,
                              selectedProjects: state.projects.map((p) => p.id),
                            }));
                          } else {
                            setState((prev) => ({
                              ...prev,
                              selectedProjects: [],
                            }));
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-2">Project Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Progress</th>
                    <th className="text-left p-2">Budget</th>
                    <th className="text-left p-2">Manager</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.projects.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Checkbox
                          checked={state.selectedProjects.includes(project.id)}
                          onCheckedChange={() =>
                            handleProjectSelection(project.id)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {project.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getProjectTypeIcon(project.type)}
                          <span className="text-sm capitalize">
                            {project.type.replace("-", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(project.status)}
                          {getStatusBadge(project.status)}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {project.progress}%
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div>{formatCurrency(project.budget)}</div>
                          <div className="text-muted-foreground">
                            Spent: {formatCurrency(project.spent)}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div>{project.manager}</div>
                          <div className="text-muted-foreground">
                            {project.teamSize} members
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getProjectTypeIcon(project.type)}
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium">
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Spent</p>
                      <p className="font-medium">
                        {formatCurrency(project.spent)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Manager</p>
                      <p className="font-medium">{project.manager}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Team Size</p>
                      <p className="font-medium">{project.teamSize}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Actions */}
      {state.selectedProjects.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {state.selectedProjects.length} project(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
