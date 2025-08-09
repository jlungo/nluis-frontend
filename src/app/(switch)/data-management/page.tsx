import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Map, Layers, Database } from "lucide-react";

interface Village {
  id: number;
  name: string;
  draft: string;
  status: "active" | "inactive";
}

interface SpatialLayer {
  id: string;
  name: string;
  type: "village" | "regional" | "zonal" | "national" | "ccro";
  status: "occupied" | "available";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geometry: any;
}

interface DataCollectionState {
  villages: Village[];
  selectedVillage: number | null;
  spatialLayers: SpatialLayer[];
  loading: boolean;
  downloadProgress: number;
  isDownloading: boolean;
}

export default function DataCollectionPage() {
  const { setPage } = usePageStore();
  const [state, setState] = useState<DataCollectionState>({
    villages: [],
    selectedVillage: null,
    spatialLayers: [],
    loading: true,
    downloadProgress: 0,
    isDownloading: false,
  });

  useLayoutEffect(() => {
    setPage({
      module: "data-management",
      title: "Data Management",
      backButton: "Back to Modules",
    });
  }, [setPage]);

  useEffect(() => {
    loadVillages();
    loadSpatialLayers();
  }, []);

  const loadVillages = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await ReadService.getVillages()
      const mockVillages: Village[] = [
        {
          id: 1,
          name: "Kampala Central",
          draft: "Draft 1.2",
          status: "active",
        },
        {
          id: 2,
          name: "Entebbe District",
          draft: "Draft 2.1",
          status: "active",
        },
        {
          id: 3,
          name: "Jinja Municipality",
          draft: "Draft 1.0",
          status: "active",
        },
        { id: 4, name: "Mbarara City", draft: "Draft 3.0", status: "inactive" },
        { id: 5, name: "Gulu District", draft: "Draft 1.5", status: "active" },
      ];

      setState((prev) => ({
        ...prev,
        villages: mockVillages,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading villages:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const loadSpatialLayers = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await GeoServer.getSpatialLayers()
      const mockLayers: SpatialLayer[] = [
        {
          id: "1",
          name: "Village Land Use",
          type: "village",
          status: "occupied",
          geometry: null,
        },
        {
          id: "2",
          name: "Regional Land Use",
          type: "regional",
          status: "available",
          geometry: null,
        },
        {
          id: "3",
          name: "Zonal Land Use",
          type: "zonal",
          status: "occupied",
          geometry: null,
        },
        {
          id: "4",
          name: "National Land Use",
          type: "national",
          status: "available",
          geometry: null,
        },
        {
          id: "5",
          name: "CCRO Boundaries",
          type: "ccro",
          status: "occupied",
          geometry: null,
        },
      ];

      setState((prev) => ({
        ...prev,
        spatialLayers: mockLayers,
      }));
    } catch (error) {
      console.error("Error loading spatial layers:", error);
    }
  };

  const handleVillageChange = (villageId: string) => {
    setState((prev) => ({
      ...prev,
      selectedVillage: parseInt(villageId),
    }));
  };

  const downloadSHP = async () => {
    if (!state.selectedVillage) {
      alert("Please select a village first");
      return;
    }

    setState((prev) => ({ ...prev, isDownloading: true, downloadProgress: 0 }));

    try {
      // Simulate download progress
      const interval = setInterval(() => {
        setState((prev) => {
          if (prev.downloadProgress >= 100) {
            clearInterval(interval);
            return { ...prev, isDownloading: false, downloadProgress: 0 };
          }
          return { ...prev, downloadProgress: prev.downloadProgress + 10 };
        });
      }, 200);

      // TODO: Replace with actual API call
      // await CreateService.downloadSHP({
      //     village: state.selectedVillage,
      //     project: projectId,
      //     stage: 0
      // })

      console.log("Download completed for village:", state.selectedVillage);
    } catch (error) {
      console.error("Error downloading SHP:", error);
      setState((prev) => ({
        ...prev,
        isDownloading: false,
        downloadProgress: 0,
      }));
    }
  };

  const getLayerTypeColor = (type: string) => {
    switch (type) {
      case "village":
        return "bg-blue-500";
      case "regional":
        return "bg-green-500";
      case "zonal":
        return "bg-yellow-500";
      case "national":
        return "bg-purple-500";
      case "ccro":
        return "bg-red-500";
      default:
        return "bg-gray-500";
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
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            CCRO Layers Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Select Village:</label>
              <Select
                value={state.selectedVillage?.toString() || ""}
                onValueChange={handleVillageChange}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose Village" />
                </SelectTrigger>
                <SelectContent>
                  {state.villages.map((village) => (
                    <SelectItem key={village.id} value={village.id.toString()}>
                      {village.name} - {village.draft}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={downloadSHP}
              disabled={!state.selectedVillage || state.isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {state.isDownloading ? "Downloading..." : "Download SHP"}
            </Button>
          </div>

          {/* Download Progress */}
          {state.isDownloading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Download Progress</span>
                <span>{state.downloadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.downloadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Spatial Data Layers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Interactive Map View</p>
              <p className="text-sm text-gray-500">
                Map integration will be implemented here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spatial Layers List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Spatial Layers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.spatialLayers.map((layer) => (
              <div
                key={layer.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{layer.name}</h3>
                  <Badge
                    variant={
                      layer.status === "occupied" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {layer.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getLayerTypeColor(
                      layer.type
                    )}`}
                  ></div>
                  <span className="text-sm text-muted-foreground capitalize">
                    {layer.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Villages</p>
                <p className="text-2xl font-bold">{state.villages.length}</p>
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
                <p className="text-sm text-muted-foreground">Spatial Layers</p>
                <p className="text-2xl font-bold">
                  {state.spatialLayers.length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Layers className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Layers</p>
                <p className="text-2xl font-bold">
                  {
                    state.spatialLayers.filter((l) => l.status === "occupied")
                      .length
                  }
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
