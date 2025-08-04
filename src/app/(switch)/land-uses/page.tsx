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
  Map,
  Search,
  Filter,
  Plus,
  ShoppingCart,
  Eye,
  Download,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";

interface LandUseProject {
  id: string;
  name: string;
  type: "village" | "ward" | "district" | "regional" | "zonal";
  status: "draft" | "active" | "completed" | "expired";
  region: string;
  district: string;
  village?: string;
  ward?: string;
  area: number;
  parties: number;
  documents: number;
  createdAt: string;
  updatedAt: string;
  expiryDate: string;
  selected: boolean;
}

interface LandUseType {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Locality {
  id: number;
  name: string;
  type: "region" | "district" | "ward" | "village";
  parentId?: number;
}

interface LandUseState {
  projects: LandUseProject[];
  filteredProjects: LandUseProject[];
  landUseTypes: LandUseType[];
  localities: Locality[];
  regions: Locality[];
  districts: Locality[];
  wards: Locality[];
  villages: Locality[];
  selectedRegion: string;
  selectedDistrict: string;
  selectedWard: string;
  selectedVillage: string;
  selectedType: string;
  searchTerm: string;
  statusFilter: string;
  viewMode: "grid" | "list" | "map";
  loading: boolean;
  checkoutItems: LandUseProject[];
  showCheckout: boolean;
}

export default function LandUsesPage() {
  const { setPage } = usePageStore();
  const [state, setState] = useState<LandUseState>({
    projects: [],
    filteredProjects: [],
    landUseTypes: [],
    localities: [],
    regions: [],
    districts: [],
    wards: [],
    villages: [],
    selectedRegion: "",
    selectedDistrict: "",
    selectedWard: "",
    selectedVillage: "",
    selectedType: "",
    searchTerm: "",
    statusFilter: "",
    viewMode: "grid",
    loading: true,
    checkoutItems: [],
    showCheckout: false,
  });

    useLayoutEffect(() => {
        setPage({
      module: "land-uses",
      title: "Land Use Management",
      backButton: "Back to Modules",
    });
  }, [setPage]);

  useEffect(() => {
    loadData();
    loadLocalities();
    loadLandUseTypes();
  }, []);

  useEffect(() => {
    filterData();
  }, [
    state.projects,
    state.searchTerm,
    state.statusFilter,
    state.selectedRegion,
    state.selectedDistrict,
    state.selectedWard,
    state.selectedVillage,
    state.selectedType,
  ]);

  const loadData = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await ProjectsService.getLandUseProjects()
      const mockProjects: LandUseProject[] = [
        {
          id: "LUP001",
          name: "Kampala Central Land Use Plan",
          type: "village",
          status: "active",
          region: "Central",
          district: "Kampala",
          village: "Kampala Central",
          area: 1250.5,
          parties: 45,
          documents: 23,
          createdAt: "2024-01-15",
          updatedAt: "2024-02-20",
          expiryDate: "2025-01-15",
          selected: false,
        },
        {
          id: "LUP002",
          name: "Entebbe District Planning",
          type: "district",
          status: "draft",
          region: "Central",
          district: "Wakiso",
          area: 3200.8,
          parties: 78,
          documents: 34,
          createdAt: "2024-01-20",
          updatedAt: "2024-02-15",
          expiryDate: "2025-01-20",
          selected: false,
        },
        {
          id: "LUP003",
          name: "Jinja Regional Development",
          type: "regional",
          status: "completed",
          region: "Eastern",
          district: "Jinja",
          area: 8500.2,
          parties: 156,
          documents: 67,
          createdAt: "2024-01-10",
          updatedAt: "2024-02-25",
          expiryDate: "2025-01-10",
          selected: false,
        },
        {
          id: "LUP004",
          name: "Mbarara Zonal Planning",
          type: "zonal",
          status: "expired",
          region: "Western",
          district: "Mbarara",
          area: 12000.0,
          parties: 234,
          documents: 89,
          createdAt: "2024-01-05",
          updatedAt: "2024-02-10",
          expiryDate: "2024-01-05",
          selected: false,
        },
        {
          id: "LUP005",
          name: "Gulu Ward Planning",
          type: "ward",
          status: "active",
          region: "Northern",
          district: "Gulu",
          ward: "Gulu Central",
          area: 450.3,
          parties: 23,
          documents: 12,
          createdAt: "2024-01-25",
          updatedAt: "2024-02-28",
          expiryDate: "2025-01-25",
          selected: false,
        },
      ];

      setState((prev) => ({
        ...prev,
        projects: mockProjects,
        filteredProjects: mockProjects,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading land use projects:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const loadLocalities = async () => {
    try {
      // TODO: Replace with actual API call
      const mockLocalities: Locality[] = [
        { id: 1, name: "Central", type: "region" },
        { id: 2, name: "Eastern", type: "region" },
        { id: 3, name: "Western", type: "region" },
        { id: 4, name: "Northern", type: "region" },
        { id: 5, name: "Kampala", type: "district", parentId: 1 },
        { id: 6, name: "Wakiso", type: "district", parentId: 1 },
        { id: 7, name: "Jinja", type: "district", parentId: 2 },
        { id: 8, name: "Mbarara", type: "district", parentId: 3 },
        { id: 9, name: "Gulu", type: "district", parentId: 4 },
      ];

      const regions = mockLocalities.filter((l) => l.type === "region");
      const districts = mockLocalities.filter((l) => l.type === "district");

      setState((prev) => ({
        ...prev,
        localities: mockLocalities,
        regions,
        districts,
      }));
    } catch (error) {
      console.error("Error loading localities:", error);
    }
  };

  const loadLandUseTypes = async () => {
    try {
      // TODO: Replace with actual API call
      const mockTypes: LandUseType[] = [
        {
          id: "1",
          name: "Residential",
          description: "Housing and residential areas",
          category: "Urban",
        },
        {
          id: "2",
          name: "Commercial",
          description: "Business and commercial zones",
          category: "Urban",
        },
        {
          id: "3",
          name: "Agricultural",
          description: "Farming and agricultural land",
          category: "Rural",
        },
        {
          id: "4",
          name: "Industrial",
          description: "Manufacturing and industrial zones",
          category: "Urban",
        },
        {
          id: "5",
          name: "Conservation",
          description: "Protected and conservation areas",
          category: "Environmental",
        },
      ];

      setState((prev) => ({
        ...prev,
        landUseTypes: mockTypes,
      }));
    } catch (error) {
      console.error("Error loading land use types:", error);
    }
  };

  const filterData = () => {
    let filtered = state.projects;

    // Search filter
    if (state.searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (state.statusFilter) {
      filtered = filtered.filter((item) => item.status === state.statusFilter);
    }

    // Type filter
    if (state.selectedType) {
      filtered = filtered.filter((item) => item.type === state.selectedType);
    }

    // Region filter
    if (state.selectedRegion) {
      filtered = filtered.filter(
        (item) => item.region === state.selectedRegion
      );
    }

    // District filter
    if (state.selectedDistrict) {
      filtered = filtered.filter(
        (item) => item.district === state.selectedDistrict
      );
    }

    setState((prev) => ({
      ...prev,
      filteredProjects: filtered,
    }));
  };

  //   const getStatusColor = (status: string) => {
  //     switch (status) {
  //       case "draft":
  //         return "bg-gray-500";
  //       case "active":
  //         return "bg-green-500";
  //       case "completed":
  //         return "bg-blue-500";
  //       case "expired":
  //         return "bg-red-500";
  //       default:
  //         return "bg-gray-500";
  //     }
  //   };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "active":
        return "default";
      case "completed":
        return "default";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "village":
        return "🏘️";
      case "ward":
        return "🏢";
      case "district":
        return "🏛️";
      case "regional":
        return "🗺️";
      case "zonal":
        return "🌍";
      default:
        return "📍";
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, selected: !p.selected } : p
      ),
      filteredProjects: prev.filteredProjects.map((p) =>
        p.id === projectId ? { ...p, selected: !p.selected } : p
      ),
    }));
  };

  const addToCheckout = () => {
    const selectedProjects = state.filteredProjects.filter((p) => p.selected);
    setState((prev) => ({
      ...prev,
      checkoutItems: selectedProjects,
      showCheckout: true,
    }));
  };

  const handleRegionChange = (regionId: string) => {
    const region = state.regions.find((r) => r.id.toString() === regionId);
    const districts = state.localities.filter(
      (l) => l.type === "district" && l.parentId === parseInt(regionId)
    );

    setState((prev) => ({
      ...prev,
      selectedRegion: region?.name || "",
      selectedDistrict: "",
      selectedWard: "",
      selectedVillage: "",
      districts,
    }));
  };

  //   const handleDistrictChange = (districtId: string) => {
  //     const district = state.districts.find(
  //       (d) => d.id.toString() === districtId
  //     );
  //     const wards = state.localities.filter(
  //       (l) => l.type === "ward" && l.parentId === parseInt(districtId)
  //     );

  //     setState((prev) => ({
  //       ...prev,
  //       selectedDistrict: district?.name || "",
  //       selectedWard: "",
  //       selectedVillage: "",
  //       wards,
  //     }));
  //   };

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
          <h1 className="text-2xl font-bold">Land Use Management</h1>
          <p className="text-muted-foreground">
            Browse and manage land use planning projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={addToCheckout}
            disabled={
              state.filteredProjects.filter((p) => p.selected).length === 0
            }
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add Selected (
            {state.filteredProjects.filter((p) => p.selected).length})
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Status</SelectItem> */}
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={state.selectedType}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, selectedType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Types</SelectItem> */}
                <SelectItem value="village">Village</SelectItem>
                <SelectItem value="ward">Ward</SelectItem>
                <SelectItem value="district">District</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="zonal">Zonal</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={state.selectedRegion}
              onValueChange={handleRegionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {state.regions.map((region) => (
                  <>
                    {/* <SelectItem value={""}>Select Region</SelectItem> */}
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {region.name}
                    </SelectItem>
                  </>
                ))}
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
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{state.projects.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Map className="h-4 w-4 text-blue-600" />
              </div>
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
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">
                  {
                    state.projects.filter(
                      (p) =>
                        p.status === "active" &&
                        new Date(p.expiryDate) <
                          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ).length
                  }
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
                <p className="text-sm text-muted-foreground">Total Parties</p>
                <p className="text-2xl font-bold">
                  {state.projects.reduce((sum, p) => sum + p.parties, 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Land Use Projects</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={state.viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setState((prev) => ({ ...prev, viewMode: "grid" }))
                }
              >
                Grid
              </Button>
              <Button
                variant={state.viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setState((prev) => ({ ...prev, viewMode: "list" }))
                }
              >
                List
              </Button>
              <Button
                variant={state.viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setState((prev) => ({ ...prev, viewMode: "map" }))
                }
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {state.viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {getTypeIcon(project.type)}
                        </span>
                        <div>
                          <CardTitle className="text-lg">
                            {project.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {project.id}
                          </p>
                        </div>
                      </div>
                      <Checkbox
                        checked={project.selected}
                        onCheckedChange={() =>
                          toggleProjectSelection(project.id)
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground capitalize">
                          {project.type}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {project.district}, {project.region}
                        </p>
                        {project.village && (
                          <p className="text-xs text-muted-foreground">
                            {project.village}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Area</p>
                          <p className="font-medium">{project.area} ha</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Parties</p>
                          <p className="font-medium">{project.parties}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Docs</p>
                          <p className="font-medium">{project.documents}</p>
                        </div>
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

          {state.viewMode === "list" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Select</th>
                    <th className="text-left p-2">Project</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Location</th>
                    <th className="text-left p-2">Area (ha)</th>
                    <th className="text-left p-2">Parties</th>
                    <th className="text-left p-2">Documents</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <Checkbox
                          checked={project.selected}
                          onCheckedChange={() =>
                            toggleProjectSelection(project.id)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {project.id}
                          </p>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="text-sm capitalize">
                          {project.type}
                        </span>
                      </td>
                      <td className="p-2">
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="text-sm">{project.district}</p>
                          <p className="text-xs text-muted-foreground">
                            {project.region}
                          </p>
                        </div>
                      </td>
                      <td className="p-2">{project.area}</td>
                      <td className="p-2">{project.parties}</td>
                      <td className="p-2">{project.documents}</td>
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

          {state.viewMode === "map" && (
            <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Interactive Map View</p>
                <p className="text-sm text-gray-500">
                  Map integration will be implemented here
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
