// src/queries/useSubdivisionZoneQuery.ts
// React Query hooks for Subdivision Zone endpoints (mobile workflow)
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface SubdivisionZone {
  id: number;
  zone_name: string;
  locality_id: number;
  locality_name: string;
  land_use_name?: string;
  can_be_subdivided: boolean;
  area_sqm: number;
  geom?: GeoJSON.MultiPolygon | GeoJSON.Polygon;
}

const SUBDIVISION_ZONES_KEY = "subdivision-zones";

// List zones available for subdivision (no geometry - fast)
export const useSubdivisionZonesQuery = (localityId?: number | string | null) =>
  useQuery({
    queryKey: [SUBDIVISION_ZONES_KEY, localityId],
    enabled: !!localityId,
    queryFn: async () => {
      const response = await api.get(`/zoning/subdivision-zones/`, {
        params: { locality: localityId },
      });
      return response.data as SubdivisionZone[];
    },
  });

// Get single zone WITH geometry (for map rendering)
export const useSubdivisionZoneDetailQuery = (
  zoneId?: number | string | null,
  localityId?: number | string | null
) =>
  useQuery({
    queryKey: [SUBDIVISION_ZONES_KEY, zoneId, localityId],
    enabled: !!zoneId && !!localityId,
    queryFn: async () => {
      const response = await api.get(`/zoning/subdivision-zones/${zoneId}/`, {
        params: { locality: localityId },
      });
      return response.data as SubdivisionZone;
    },
  });
