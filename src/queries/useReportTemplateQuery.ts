import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const reportTemplateQueryKey = "report-templates";

export interface ReportTemplateProps {
  id: number;
  slug: string;
  name: string;
  description?: string;
  module: number;
  module_name: string;
  module_slug: string;
  locality_level: number;
  level_name: string;
  template_file: string;
  placeholders: string[];
  placeholder_mappings: Record<string, string>;
  is_active: boolean;
  created_date: string;
  created_by_name?: string;
}

export interface ReportTemplateListParams {
  module?: string;
  locality_level?: number;
  is_active?: boolean;
  search?: string;
}

// List all report templates
export const useReportTemplatesQuery = (params?: ReportTemplateListParams) => {
  return useQuery({
    queryKey: [reportTemplateQueryKey, params],
    queryFn: async () => {
      const response = await api.get("/reports/templates/", { params });
      return response.data as ReportTemplateProps[];
    },
  });
};

// Get single report template by slug
export const useReportTemplateQuery = (slug: string | undefined) => {
  return useQuery({
    queryKey: [reportTemplateQueryKey, slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug is required");
      const response = await api.get(`/reports/templates/${slug}/`);
      return response.data as ReportTemplateProps;
    },
    enabled: !!slug,
  });
};

// Create new report template
export const useCreateReportTemplateMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("/reports/templates/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [reportTemplateQueryKey] });
    },
  });
};

// Update report template
export const useUpdateReportTemplateMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: FormData }) => {
      const response = await api.patch(`/reports/templates/${slug}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [reportTemplateQueryKey] });
      queryClient.invalidateQueries({ queryKey: [reportTemplateQueryKey, variables.slug] });
    },
  });
};

// Update placeholder mappings
export const useUpdatePlaceholderMappingsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      slug,
      mappings,
    }: {
      slug: string;
      mappings: Record<string, string>;
    }) => {
      const response = await api.post(`/reports/templates/${slug}/update_mappings/`, {
        placeholder_mappings: mappings,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [reportTemplateQueryKey, variables.slug] });
    },
  });
};

// Re-extract placeholders from template file
export const useReextractPlaceholdersMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await api.post(`/reports/templates/${slug}/reextract_placeholders/`);
      return response.data;
    },
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: [reportTemplateQueryKey, slug] });
    },
  });
};

// Generate report from template
export const useGenerateReportMutation = () => {
  return useMutation({
    mutationFn: async ({
      slug,
      workflow_data,
    }: {
      slug: string;
      workflow_data: Record<string, any>;
    }) => {
      const response = await api.post(
        `/reports/templates/${slug}/generate_report/`,
        { workflow_data },
        {
          responseType: "blob",
        }
      );
      return response.data;
    },
  });
};

// Delete report template
export const useDeleteReportTemplateMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (slug: string) => {
      await api.delete(`/reports/templates/${slug}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [reportTemplateQueryKey] });
    },
  });
};
