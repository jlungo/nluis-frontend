import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { APIResponse } from "@/types/api-response";
import { CreateProjectDataI, LocalityI, LocalityLevelI, ProjectFunderI, ProjectI, ProjectQueryParamsI, ProjectStatsI, ProjectTypeI } from "@/types/projects";

export const useProjectsQuery = (options: ProjectQueryParamsI) => {
  return useQuery({
    queryKey: options.id
      ? ["project", options.id]
      : ["projects", options],
    queryFn: async (): Promise<APIResponse<ProjectI>> => {
      if (options.id) {
        // Fetch a single project by id
        const response = await api.get<APIResponse<ProjectI>>(`/projects/${options.id}`);
        return response.data;
      } else {
        // Fetch multiple projects with optional params
        const response = await api.get<APIResponse<ProjectI>>(`/projects/`, {
          params: options,
        });
        return response.data;
      }
    },
    enabled: !!options.id || !!options,
  });
};

export const useUpdateProject = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateProjectDataI }) => {
      const response = await api.put(`/projects/${id}/`, data);
      return response.data;
    },
  });
};

// export const useUpdateProject = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async ({ id, ...projectData }: CreateProjectDataI & { id: string }): Promise<APIResponse<ProjectI>> => {
//       const response = await api.put<APIResponse<ProjectI>>(`/projects/${id}/`, projectData);
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['projects'] });
//     },
//   });
// };

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: string): Promise<void> => {
      await api.delete(`/projects/${projectId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useProjectStats = (organization_id?: string) => {
  return useQuery({
    queryKey: ['projectStats', organization_id],
    queryFn: async (): Promise<APIResponse<ProjectStatsI>> => {
      const response = await api.get(`/projects/stats?organization_id=${organization_id}`);
      return response.data;
    }
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectData: CreateProjectDataI): Promise<APIResponse<ProjectI>> => {
      console.log('Creating project with data:', projectData);

      const response = await api.post<APIResponse<ProjectI>>('/projects/create/', projectData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the projects query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useProjectTypes = () => {
  return useQuery({
    queryKey: ['projectTypes'],
    queryFn: async (): Promise<APIResponse<ProjectTypeI>> => {
      const response = await api.get('/projects/public/project-types');
      return response.data;
    },
  });
};

export const useFunders = () => {
  return useQuery({
    queryKey: ['funders'],
    queryFn: async (): Promise<ProjectFunderI[]> => {
      const response = await api.get('/setup/funders');
      return response.data;
    },
  });
};

export const useLevels = () => {
  return useQuery({
    queryKey: ['levels'],
    queryFn: async (): Promise<APIResponse<LocalityLevelI[]>> => {
      const response = await api.get('/localities/levels/');
      return response.data;
    },
  });
};

export const useLocalities = () => {
  return useQuery({
    queryKey: ['localities'],
    queryFn: async (): Promise<LocalityI[]> => {
      const response = await api.get('/localities/localities/');
      console.log('Fetched localities:', response);
      return response.data;
    },
  });
};
