import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { APIResponse } from "@/types/api-response";
import type {
  CreateProjectDataI,
  LocalityLevelI,
  ProjectFunderI,
  ProjectI,
  ProjectQueryParamsI,
  ProjectStatsI,
  ProjectTypeI,
} from "@/types/projects";

export const queryProjectKey = "projects";

export const useProjectsQuery = (params: ProjectQueryParamsI) => {
  return useQuery<APIResponse<ProjectI>>({
    queryKey: [queryProjectKey, params],
    queryFn: () => api.get(`/projects/`, { params }).then((res) => res.data),
  });
};

export const useProjectQuery = (project_id?: string) => {
  return useQuery<ProjectI>({
    queryKey: [queryProjectKey, project_id],
    queryFn: () =>
      api.get(`/projects/${project_id}`).then((res) => res.data.results),
    enabled: !!project_id,
  });
};

export const useUpdateProject = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreateProjectDataI;
    }) => {
      const response = await api.put(`/projects/${id}/update/`, data);
      return response.data;
    },
  });
};

export const useDeleteProject = () => {
  return useMutation({
    mutationFn: async (projectId: string): Promise<void> => {
      await api.delete(`/projects/${projectId}/delete/`);
    },
  });
};

export const useProjectStats = (organization_id?: string) => {
  return useQuery({
    queryKey: ["projectStats", organization_id],
    queryFn: async (): Promise<APIResponse<ProjectStatsI>> => {
      const response = await api.get(
        `/projects/stats?organization_id=${organization_id}`
      );
      return response.data;
    },
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      projectData: CreateProjectDataI
    ): Promise<APIResponse<ProjectI>> => {
      const response = await api.post<APIResponse<ProjectI>>(
        "/projects/create/",
        projectData
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useProjectTypes = () => {
  return useQuery({
    queryKey: ["projectTypes"],
    queryFn: async (): Promise<APIResponse<ProjectTypeI>> => {
      const response = await api.get("/projects/public/project-types");
      return response.data;
    },
  });
};

export const useFunders = () => {
  return useQuery({
    queryKey: ["funders"],
    queryFn: async (): Promise<ProjectFunderI[]> => {
      const response = await api.get("/setup/funders");
      return response.data;
    },
  });
};

export const useLevels = () => {
  return useQuery({
    queryKey: ["levels"],
    queryFn: async (): Promise<APIResponse<LocalityLevelI[]>> => {
      const response = await api.get("/localities/levels/");
      return response.data;
    },
  });
};
