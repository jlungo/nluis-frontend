import api from "@/lib/axios";
import type { LocalityI } from "@/types/projects";
import { GeoJSONFeatureCollectionType } from "@/types/zoning";
import { useQuery } from "@tanstack/react-query";

export const localityQueryKey = "locality";

export const useLocalitiesQuery = (parent?: number) => {
  return useQuery<LocalityI[]>({
    queryKey: [localityQueryKey, parent],
    queryFn: () =>
      api
        .get(`/localities/localities/?parent=${parent}`)
        .then((res) => res.data),
  });
};

export const useLocalityQuery = (level: number) => {
  return useQuery<LocalityI>({
    queryKey: [localityQueryKey, { level }],
    queryFn: () =>
      api.get(`/localities/localities/?level=${level}`).then((res) => res.data),
  });
};

export const useLocalityShapefileQuery = (locality_id?: string) => {
  return useQuery<GeoJSONFeatureCollectionType>({
    queryKey: [localityQueryKey, locality_id],
    queryFn: () =>
      api.get(`/localities/localities/${locality_id}/boundary/`).then((res) => res.data),
    enabled: !!locality_id,
  });
};
