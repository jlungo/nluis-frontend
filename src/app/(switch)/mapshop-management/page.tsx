import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState, useEffect, useRef } from "react";
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
import { Map, Layers, Upload, Users, Filter, Search, Info } from "lucide-react";

interface Plot {
  id: string;
  claimNo: string;
  status: "available" | "occupied" | "pending";
  area: number;
  coordinates: [number, number];
  owner?: string;
  description?: string;
}

interface SpatialLayer {
  id: string;
  name: string;
  type: "plots" | "boundaries" | "beacons" | "labels";
  visible: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

interface MapState {
  selectedPlots: string[];
  selectedPlotDetails: Plot[];
  layers: SpatialLayer[];
  baseMap: "satellite" | "hybrid" | "gray" | "blank";
  viewMode: "2d" | "3d";
  loading: boolean;
  showLayerManager: boolean;
  showPlotDetails: boolean;
  searchTerm: string;
  statusFilter: string;
  areaFilter: string;
}

export default function MapShopManagementPage() {
  const { setPage } = usePageStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<MapState>({
    selectedPlots: [],
    selectedPlotDetails: [],
    layers: [
      {
        id: "plots",
        name: "Project Plots",
        type: "plots",
        visible: true,
        data: [],
      },
      {
        id: "labels",
        name: "Plot Labels",
        type: "labels",
        visible: true,
        data: [],
      },
      {
        id: "beacons",
        name: "Beacons",
        type: "beacons",
        visible: false,
        data: [],
      },
      {
        id: "boundaries",
        name: "Village Boundaries",
        type: "boundaries",
        visible: false,
        data: [],
      },
    ],
    baseMap: "satellite",
    viewMode: "2d",
    loading: true,
    showLayerManager: false,
    showPlotDetails: false,
    searchTerm: "",
    statusFilter: "",
    areaFilter: "",
  });

  useLayoutEffect(() => {
    setPage({
      module: "mapshop-management",
      title: "MapShop Management",
    });
  }, [setPage]);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockPlots: Plot[] = [
        {
          id: "1",
          claimNo: "CLM001",
          status: "available",
          area: 2.5,
          coordinates: [-6.085936, 35.711995],
          description: "Agricultural land",
        },
        {
          id: "2",
          claimNo: "CLM002",
          status: "occupied",
          area: 1.8,
          coordinates: [-6.086936, 35.712995],
          owner: "John Doe",
          description: "Residential plot",
        },
        {
          id: "3",
          claimNo: "CLM003",
          status: "pending",
          area: 3.2,
          coordinates: [-6.084936, 35.710995],
          description: "Commercial land",
        },
      ];

      setState((prev) => ({
        ...prev,
        layers: prev.layers.map((layer) =>
          layer.id === "plots" ? { ...layer, data: mockPlots } : layer
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading map data:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  //   const handlePlotSelection = (plotId: string) => {
  //     setState((prev) => {
  //       const isSelected = prev.selectedPlots.includes(plotId);
  //       const newSelectedPlots = isSelected
  //         ? prev.selectedPlots.filter((id) => id !== plotId)
  //         : [...prev.selectedPlots, plotId];

  //       return {
  //         ...prev,
  //         selectedPlots: newSelectedPlots,
  //       };
  //     });
  //   };

  const handleLayerToggle = (layerId: string) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      ),
    }));
  };

  const handleBaseMapChange = (
    baseMap: "satellite" | "hybrid" | "gray" | "blank"
  ) => {
    setState((prev) => ({ ...prev, baseMap }));
  };

  const handleAllocatePlots = () => {
    // TODO: Implement plot allocation functionality
    console.log("Allocating plots:", state.selectedPlots);
  };

  const handleAddLayer = () => {
    // TODO: Implement layer upload functionality
    console.log("Adding new layer");
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
          <h1 className="text-2xl font-bold">Spatial Data Management</h1>
          <p className="text-muted-foreground">
            Manage spatial layers, plots, and land formalization data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                showLayerManager: !prev.showLayerManager,
              }))
            }
          >
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </Button>
          <Button onClick={handleAddLayer}>
            <Upload className="h-4 w-4 mr-2" />
            Add Layer
          </Button>
          {state.selectedPlots.length > 0 && (
            <Button onClick={handleAllocatePlots} variant="destructive">
              <Users className="h-4 w-4 mr-2" />
              Allocate ({state.selectedPlots.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Map Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plots..."
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
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={state.areaFilter}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, areaFilter: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by area" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Areas</SelectItem> */}
                <SelectItem value="0-1">0-1 ha</SelectItem>
                <SelectItem value="1-5">1-5 ha</SelectItem>
                <SelectItem value="5+">5+ ha</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={state.baseMap}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onValueChange={(value: any) => handleBaseMapChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Base map" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="gray">Gray</SelectItem>
                <SelectItem value="blank">Blank</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Layer Manager */}
        {state.showLayerManager && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Layers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={layer.visible}
                        onCheckedChange={() => handleLayerToggle(layer.id)}
                      />
                      <span className="text-sm">{layer.name}</span>
                    </div>
                    <Badge variant="secondary">{layer.data.length}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map */}
        <div
          className={`${state.showLayerManager ? "lg:col-span-3" : "lg:col-span-4"
            }`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Interactive Map
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={state.viewMode === "2d" ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setState((prev) => ({ ...prev, viewMode: "2d" }))
                    }
                  >
                    2D
                  </Button>
                  <Button
                    variant={state.viewMode === "3d" ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setState((prev) => ({ ...prev, viewMode: "3d" }))
                    }
                  >
                    3D
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                className="w-full h-[600px] bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center"
              >
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Interactive Map</p>
                  <p className="text-sm text-muted-foreground">
                    Map integration with Leaflet/Mapbox will be implemented here
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Available Plots</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Occupied Plots</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Pending Plots</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Plots Summary */}
      {state.selectedPlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Selected Plots ({state.selectedPlots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {state.layers
                    .find((l) => l.id === "plots")
                    ?.data.filter((p) => p.status === "available").length || 0}
                </div>
                <div className="text-sm text-green-600">Available</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {state.layers
                    .find((l) => l.id === "plots")
                    ?.data.filter((p) => p.status === "pending").length || 0}
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {state.layers
                    .find((l) => l.id === "plots")
                    ?.data.filter((p) => p.status === "occupied").length || 0}
                </div>
                <div className="text-sm text-red-600">Occupied</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
