// src/queries/useSpatialParcelQuery.ts
// React Query hooks for Spatial Parcel endpoints (survey/CCRO workflow)
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface SpatialParcel {
  id: number;
  parcel_number: string;
  uka_namba?: string;
  geometry_type: string;
  area_sqm: number;
  stage: 'draft' | 'gis_approval' | 'registered' | 'printed';
  land_application?: number;
  land_use_zone?: number;
  zone_name?: string;
  locality: number;
  locality_name?: string;
  hamlet?: string;
  north?: string;
  south?: string;
  east?: string;
  west?: string;
  occupancy_type?: number;
  has_conflicts: boolean;
  conflict_details?: ConflictDetail[];
  geom?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  created_at: string;
  updated_at?: string;
}

export interface ConflictDetail {
  type: 'overlap' | 'outside_zone';
  message: string;
  parcels?: { id: number; parcel_number: string }[];
}

export interface ParcelPhoto {
  id: number;
  parcel: number;
  photo_url: string;
  photo_type: 'site' | 'boundary' | 'marker' | 'other';
  caption?: string;
  captured_at: string;
  captured_by_name?: string;
}

export interface CreateParcelPayload {
  land_application?: number;
  land_use_zone?: number;
  locality: number;
  hamlet?: string;
  geom: {
    type: 'Polygon';
    coordinates: number[][][];
    srid?: number;
  };
  north?: string;
  south?: string;
  east?: string;
  west?: string;
  occupancy_type?: number;
}

export interface ParcelFilters {
  locality?: number | string;
  zone?: number | string;
  application?: number | string;
  stage?: string;
  my_parcels?: boolean;
  has_conflicts?: boolean;
  ready_for_ccro?: boolean;
}

const PARCELS_KEY = "spatial-parcels";

// ============================================================================
// LIST & DETAIL QUERIES
// ============================================================================

export const useSpatialParcelsQuery = (filters?: ParcelFilters) =>
  useQuery({
    queryKey: [PARCELS_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get(`/spatial/parcels/?${params}`);
      const data = response.data;
      return Array.isArray(data) ? data : data.results || [];
    },
  });

export const useSpatialParcelQuery = (id?: number | string) =>
  useQuery({
    queryKey: [PARCELS_KEY, id],
    enabled: !!id,
    queryFn: async () => {
      const response = await api.get(`/spatial/parcels/${id}/`);
      return response.data as SpatialParcel;
    },
  });

// GeoJSON endpoint for map display
export const useSpatialParcelsGeoJSONQuery = (filters?: ParcelFilters) =>
  useQuery({
    queryKey: [PARCELS_KEY, 'geojson', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get(`/spatial/parcels/geojson/?${params}`);
      return response.data;
    },
  });

// ============================================================================
// CRUD MUTATIONS
// ============================================================================

export const useCreateSpatialParcel = (opts?: { onSuccess?: (data: SpatialParcel) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateParcelPayload) =>
      api.post('/spatial/parcels/', payload).then((r) => r.data as SpatialParcel),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [PARCELS_KEY] });
      opts?.onSuccess?.(data);
    },
  });
};

export const useUpdateSpatialParcel = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<CreateParcelPayload> }) =>
      api.patch(`/spatial/parcels/${id}/`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [PARCELS_KEY, vars.id] });
      qc.invalidateQueries({ queryKey: [PARCELS_KEY] });
      opts?.onSuccess?.();
    },
  });
};

export const useDeleteSpatialParcel = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.delete(`/spatial/parcels/${id}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PARCELS_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// ============================================================================
// CONFLICT CHECK
// ============================================================================

export const useCheckParcelConflicts = (opts?: { onSuccess?: (data: { has_conflicts: boolean; conflicts: ConflictDetail[] }) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.post(`/spatial/parcels/${id}/check_conflicts/`).then((r) => r.data),
    onSuccess: (data, id) => {
      qc.invalidateQueries({ queryKey: [PARCELS_KEY, id] });
      opts?.onSuccess?.(data);
    },
  });
};

// ============================================================================
// PHOTO UPLOAD
// ============================================================================

export const useUploadParcelPhotos = (opts?: { onSuccess?: (data: ParcelPhoto[]) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      parcelId,
      photos,
      photoType,
      caption,
    }: {
      parcelId: number;
      photos: File[];
      photoType?: string;
      caption?: string;
    }) => {
      const formData = new FormData();
      formData.append('parcel', String(parcelId));
      photos.forEach((file) => formData.append('photos', file));
      if (photoType) formData.append('photo_type', photoType);
      if (caption) formData.append('caption', caption);

      const response = await api.post('/spatial/parcel-photos/bulk_upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data as ParcelPhoto[];
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [PARCELS_KEY] });
      opts?.onSuccess?.(data);
    },
  });
};

// Get photos for a parcel
export const useParcelPhotosQuery = (parcelId?: number | string) =>
  useQuery({
    queryKey: [PARCELS_KEY, parcelId, 'photos'],
    enabled: !!parcelId,
    queryFn: async () => {
      const response = await api.get(`/spatial/parcel-photos/`, {
        params: { parcel: parcelId },
      });
      const data = response.data;
      return Array.isArray(data) ? data : data.results || [];
    },
  });
