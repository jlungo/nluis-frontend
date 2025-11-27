// src/queries/useParcelQuery.ts
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ParcelFeature, SubdivisionFeature } from "@/types/subdivision";

export const useParcelQuery = (id?: string | number) =>
  useQuery({
    queryKey: ["parcel", id],
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
    queryFn: async () => {
      const response = await api.get(`/parcels/${id}/`);
      return response.data as ParcelFeature;
    }
  });

export const useParcelSubdivisionsQuery = (id?: string | number) =>
  useQuery({
    queryKey: ["parcel-subdivisions", id],
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute (more frequent updates)
    gcTime: 15 * 60 * 1000, // Keep unused data in cache for 15 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds while component is mounted
    queryFn: async () => {
      const response = await api.get(`/parcels/${id}/subdivisions/`, {
        headers: {
          'Cache-Control': 'no-cache', // Ensure we don't get cached responses from browser
          'Pragma': 'no-cache'
        }
      });
      return response.data as SubdivisionFeature[];
    }
  });

export const useUpdateSubdivision = (opts?: { onDone?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      parcelId, 
      subdivisionId, 
      data 
    }: { 
      parcelId: string | number; 
      subdivisionId: string; 
      data: Partial<SubdivisionFeature>
    }) =>
      api.patch(`/parcels/${parcelId}/subdivisions/${subdivisionId}/`, data)
        .then((r) => r.data),
    onMutate: async ({ parcelId, subdivisionId, data }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await qc.cancelQueries({ queryKey: ["parcel-subdivisions", parcelId] });

      // Get current subdivisions
      const previousSubdivisions = qc.getQueryData<SubdivisionFeature[]>(
        ["parcel-subdivisions", parcelId]
      );

      // Optimistically update the subdivision
      if (previousSubdivisions) {
        qc.setQueryData<SubdivisionFeature[]>(
          ["parcel-subdivisions", parcelId],
          subdivisions => 
            subdivisions?.map(s => 
              s.properties.id === subdivisionId 
                ? { ...s, ...data }
                : s
            ) ?? []
        );
      }

      return { previousSubdivisions };
    },
    onError: (_err, { parcelId }, context) => {
      // Revert the optimistic update on error
      if (context?.previousSubdivisions) {
        qc.setQueryData(
          ["parcel-subdivisions", parcelId],
          context.previousSubdivisions
        );
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["parcel-subdivisions", vars.parcelId] });
      opts?.onDone?.();
    },
  });
};

export const useCreateSubdivision = (opts?: { onDone?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      parcelId, 
      data 
    }: { 
      parcelId: string | number; 
      data: Omit<SubdivisionFeature, "id">
    }) =>
      api.post(`/parcels/${parcelId}/subdivisions/`, data)
        .then((r) => r.data),
    onMutate: async ({ parcelId, data }) => {
      await qc.cancelQueries({ queryKey: ["parcel-subdivisions", parcelId] });

      const previousSubdivisions = qc.getQueryData<SubdivisionFeature[]>(
        ["parcel-subdivisions", parcelId]
      );

      // Create an optimistic subdivision with a temporary ID
      const tempId = `temp_${Date.now()}`;
      const optimisticSubdivision = {
        ...data,
        properties: {
          ...data.properties,
          id: tempId
        }
      } as SubdivisionFeature;

      if (previousSubdivisions) {
        qc.setQueryData<SubdivisionFeature[]>(
          ["parcel-subdivisions", parcelId],
          [...previousSubdivisions, optimisticSubdivision]
        );
      }

      return { previousSubdivisions, tempId };
    },
    onError: (_err, { parcelId }, context) => {
      if (context?.previousSubdivisions) {
        qc.setQueryData(
          ["parcel-subdivisions", parcelId],
          context.previousSubdivisions
        );
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["parcel-subdivisions", vars.parcelId] });
      opts?.onDone?.();
    },
  });
};

export const useDeleteSubdivision = (opts?: { onDone?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      parcelId, 
      subdivisionId 
    }: { 
      parcelId: string | number; 
      subdivisionId: string 
    }) =>
      api.delete(`/parcels/${parcelId}/subdivisions/${subdivisionId}/`)
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["parcel-subdivisions", vars.parcelId] });
      opts?.onDone?.();
    },
  });
};
