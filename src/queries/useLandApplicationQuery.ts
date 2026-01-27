// src/queries/useLandApplicationQuery.ts
// React Query hooks for Land Application endpoints (CCRO workflow)
import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  LandApplication,
  LandApplicationFilters,
  CreateLandApplicationPayload,
  ApprovalPayload,
  AssignSurveyorPayload,
  RejectApplicationPayload,
  VerifyNeighborPayload,
} from "@/types/landApplication";

const LAND_APP_KEY = "land-applications";

// ============================================================================
// LIST & DETAIL QUERIES
// ============================================================================

export const useLandApplicationsQuery = (filters?: LandApplicationFilters) =>
  useQuery({
    queryKey: [LAND_APP_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get(`/ccro/land-applications/?${params}`);
      const data = response.data;
      return Array.isArray(data) ? data : data.results || [];
    },
  });

export const useLandApplicationQuery = (id?: number | string) =>
  useQuery({
    queryKey: [LAND_APP_KEY, id],
    enabled: !!id,
    queryFn: async () => {
      const response = await api.get(`/ccro/land-applications/${id}/`);
      return response.data as LandApplication;
    },
  });

// ============================================================================
// CRUD MUTATIONS
// ============================================================================

export const useCreateLandApplication = (opts?: { onSuccess?: (data: LandApplication) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLandApplicationPayload) =>
      api.post('/ccro/land-applications/', payload).then((r) => r.data as LandApplication),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.(data);
    },
  });
};

export const useUpdateLandApplication = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<CreateLandApplicationPayload> }) =>
      api.patch(`/ccro/land-applications/${id}/`, data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, vars.id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

export const useDeleteLandApplication = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.delete(`/ccro/land-applications/${id}/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// ============================================================================
// WORKFLOW ACTION MUTATIONS
// ============================================================================

// Submit for verification (draft → pending_verification)
export const useSubmitLandApplication = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.post(`/ccro/land-applications/${id}/submit/`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// Verify application (pending_verification → verified)
export const useVerifyLandApplication = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.post(`/ccro/land-applications/${id}/verify/`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// Village council approval (pending_council → council_approved)
export const useCouncilApproveLandApplication = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: ApprovalPayload }) =>
      api.post(`/ccro/land-applications/${id}/council_approve/`, payload).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, vars.id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// Village assembly approval (pending_assembly → approved)
export const useAssemblyApproveLandApplication = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: ApprovalPayload }) =>
      api.post(`/ccro/land-applications/${id}/assembly_approve/`, payload).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, vars.id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// Assign surveyor (approved → assigned)
export const useAssignSurveyor = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: AssignSurveyorPayload }) =>
      api.post(`/ccro/land-applications/${id}/assign_surveyor/`, payload).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, vars.id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// Start survey (assigned → surveying) - Mobile
export const useStartSurvey = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.post(`/ccro/land-applications/${id}/start_survey/`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// Complete survey (surveying → survey_complete) - Mobile
export const useCompleteSurvey = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.post(`/ccro/land-applications/${id}/complete_survey/`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// GIS review (survey_complete → under_review)
export const useGISReview = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.post(`/ccro/land-applications/${id}/gis_review/`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// Complete application (under_review → completed)
export const useCompleteLandApplication = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) =>
      api.post(`/ccro/land-applications/${id}/complete/`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// Reject application (any stage → rejected)
export const useRejectLandApplication = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: RejectApplicationPayload }) =>
      api.post(`/ccro/land-applications/${id}/reject/`, payload).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY, vars.id] });
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};

// ============================================================================
// NEIGHBOR VERIFICATION
// ============================================================================

export const useVerifyNeighbor = (opts?: { onSuccess?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ neighborId, payload }: { neighborId: number; payload: VerifyNeighborPayload }) =>
      api.post(`/ccro/application-neighbors/${neighborId}/verify/`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LAND_APP_KEY] });
      opts?.onSuccess?.();
    },
  });
};
