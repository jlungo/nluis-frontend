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
  Map,
  Users,
  Download,
  Search,
  Filter,
  Plus,
  BarChart3,
  Table,
  Eye,
  Edit,
} from "lucide-react";

interface CCROData {
  id: string;
  villageName: string;
  district: string;
  region: string;
  status: "draft" | "pending" | "approved" | "rejected" | "issued";
  partyCount: number;
  parcelCount: number;
  area: number;
  createdAt: string;
  updatedAt: string;
}

interface Questionnaire {
  id: string;
  name: string;
  description: string;
  formCount: number;
  responseCount: number;
}

interface Locality {
  id: number;
  name: string;
  type: "region" | "district" | "ward" | "village" | "hamlet";
  parentId?: number;
}

interface CCROManagementState {
  ccroData: CCROData[];
  filteredData: CCROData[];
  questionnaires: Questionnaire[];
  localities: Locality[];
  regions: Locality[];
  districts: Locality[];
  villages: Locality[];
  selectedRegion: string;
  selectedDistrict: string;
  selectedVillage: string;
  searchTerm: string;
  statusFilter: string;
  viewMode: "table" | "cards" | "map";
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
}

export default function CCROManagementPage() {
  const { setPage } = usePageStore();
  const [state, setState] = useState<CCROManagementState>({
    ccroData: [],
    filteredData: [],
    questionnaires: [],
    localities: [],
    regions: [],
    districts: [],
    villages: [],
    selectedRegion: "",
    selectedDistrict: "",
    selectedVillage: "",
    searchTerm: "",
    statusFilter: "",
    viewMode: "table",
    loading: true,
    currentPage: 1,
    itemsPerPage: 10,
  });

    useLayoutEffect(() => {
        setPage({
      module: "ccro-management",
            title: "CCRO Management",
      backButton: "Back to Modules",
    });
  }, [setPage]);

  useEffect(() => {
    loadData();
    loadLocalities();
    loadQuestionnaires();
  }, []);

  useEffect(() => {
    filterData();
  }, [
    state.ccroData,
    state.searchTerm,
    state.statusFilter,
    state.selectedRegion,
    state.selectedDistrict,
    state.selectedVillage,
  ]);

  const loadData = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await CollectService.getCCROData()
      const mockData: CCROData[] = [
        {
          id: "CCRO001",
          villageName: "Kampala Central",
          district: "Kampala",
          region: "Central",
          status: "approved",
          partyCount: 5,
          parcelCount: 12,
          area: 45.6,
          createdAt: "2024-01-15",
          updatedAt: "2024-02-20",
        },
        {
          id: "CCRO002",
          villageName: "Entebbe District",
          district: "Wakiso",
          region: "Central",
          status: "draft",
          partyCount: 3,
          parcelCount: 8,
          area: 32.1,
          createdAt: "2024-01-20",
          updatedAt: "2024-02-15",
        },
        {
          id: "CCRO003",
          villageName: "Jinja Municipality",
          district: "Jinja",
          region: "Eastern",
          status: "pending",
          partyCount: 7,
          parcelCount: 15,
          area: 67.8,
          createdAt: "2024-01-10",
          updatedAt: "2024-02-25",
        },
        {
          id: "CCRO004",
          villageName: "Mbarara City",
          district: "Mbarara",
          region: "Western",
          status: "issued",
          partyCount: 4,
          parcelCount: 10,
          area: 28.9,
          createdAt: "2024-01-05",
          updatedAt: "2024-02-10",
        },
        {
          id: "CCRO005",
          villageName: "Gulu District",
          district: "Gulu",
          region: "Northern",
          status: "rejected",
          partyCount: 2,
          parcelCount: 6,
          area: 18.3,
          createdAt: "2024-01-25",
          updatedAt: "2024-02-28",
        },
      ];

      setState((prev) => ({
        ...prev,
        ccroData: mockData,
        filteredData: mockData,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading CCRO data:", error);
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

  const loadQuestionnaires = async () => {
    try {
      // TODO: Replace with actual API call
      const mockQuestionnaires: Questionnaire[] = [
        {
          id: "Q001",
          name: "Land Use Survey",
          description: "Comprehensive land use assessment questionnaire",
          formCount: 5,
          responseCount: 156,
        },
        {
          id: "Q002",
          name: "Party Information",
          description: "Land party and stakeholder information collection",
          formCount: 3,
          responseCount: 89,
        },
        {
          id: "Q003",
          name: "Parcel Details",
          description: "Detailed parcel and boundary information",
          formCount: 4,
          responseCount: 234,
        },
      ];

      setState((prev) => ({
        ...prev,
        questionnaires: mockQuestionnaires,
      }));
    } catch (error) {
      console.error("Error loading questionnaires:", error);
    }
  };

  const filterData = () => {
    let filtered = state.ccroData;

    // Search filter
    if (state.searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.villageName
            .toLowerCase()
            .includes(state.searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          item.district.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (state.statusFilter) {
      filtered = filtered.filter((item) => item.status === state.statusFilter);
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
      filteredData: filtered,
    }));
  };

  //   const getStatusColor = (status: string) => {
  //     switch (status) {
  //       case "draft":
  //         return "bg-gray-500";
  //       case "pending":
  //         return "bg-yellow-500";
  //       case "approved":
  //         return "bg-green-500";
  //       case "rejected":
  //         return "bg-red-500";
  //       case "issued":
  //         return "bg-blue-500";
  //       default:
  //         return "bg-gray-500";
  //     }
  //   };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "pending":
        return "default";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "issued":
        return "default";
      default:
        return "secondary";
    }
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
      selectedVillage: "",
      districts,
    }));
  };

  const handleDistrictChange = (districtId: string) => {
    const district = state.districts.find(
      (d) => d.id.toString() === districtId
    );
    const villages = state.localities.filter(
      (l) => l.type === "village" && l.parentId === parseInt(districtId)
    );

    setState((prev) => ({
      ...prev,
      selectedDistrict: district?.name || "",
      selectedVillage: "",
      villages,
    }));
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
          <h1 className="text-2xl font-bold">CCRO Management</h1>
          <p className="text-muted-foreground">
            Manage Customary Certificate of Right of Occupancy data
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New CCRO
        </Button>
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
                placeholder="Search CCROs..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
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
                  <SelectItem key={region.id} value={region.id.toString()}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={state.selectedDistrict}
              onValueChange={handleDistrictChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {state.districts.map((district) => (
                  <SelectItem key={district.id} value={district.id.toString()}>
                    {district.name}
                  </SelectItem>
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
                <p className="text-sm text-muted-foreground">Total CCROs</p>
                <p className="text-2xl font-bold">{state.ccroData.length}</p>
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
                  {state.ccroData.filter((c) => c.status === "approved").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-green-600" />
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
                  {state.ccroData.filter((c) => c.status === "pending").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-yellow-600" />
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
                  {state.ccroData.reduce((sum, c) => sum + c.partyCount, 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CCRO Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>CCRO Data</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={state.viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setState((prev) => ({ ...prev, viewMode: "table" }))
                }
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                variant={state.viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setState((prev) => ({ ...prev, viewMode: "cards" }))
                }
              >
                <BarChart3 className="h-4 w-4" />
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
          {state.viewMode === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">CCRO ID</th>
                    <th className="text-left p-2">Village</th>
                    <th className="text-left p-2">District</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Parties</th>
                    <th className="text-left p-2">Parcels</th>
                    <th className="text-left p-2">Area (ha)</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.filteredData.map((ccro) => (
                    <tr key={ccro.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{ccro.id}</td>
                      <td className="p-2">{ccro.villageName}</td>
                      <td className="p-2">{ccro.district}</td>
                      <td className="p-2">
                        <Badge variant={getStatusBadgeVariant(ccro.status)}>
                          {ccro.status}
                        </Badge>
                      </td>
                      <td className="p-2">{ccro.partyCount}</td>
                      <td className="p-2">{ccro.parcelCount}</td>
                      <td className="p-2">{ccro.area}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
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
              {state.filteredData.map((ccro) => (
                <Card
                  key={ccro.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{ccro.id}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(ccro.status)}>
                        {ccro.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">
                          {ccro.villageName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ccro.district}, {ccro.region}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Parties</p>
                          <p className="font-medium">{ccro.partyCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Parcels</p>
                          <p className="font-medium">{ccro.parcelCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Area</p>
                          <p className="font-medium">{ccro.area} ha</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
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
