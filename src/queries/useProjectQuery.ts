import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { APIResponse } from "@/types/api-response";

export interface ProjectType {
  id: number;
  name: string;
  level_id: number;
}

export interface Funder {
  id: number;
  name: string;
  category: string;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  code: string;
  parent: number | null;
  created_at: string;
  updated_at: string;
}

export interface Locality {
  id: number;
  name: string;
  code: string;
  level: number;
  parent: number | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  reg_date: string;
  auth_date: string;
  budget: number;
  published_date: string;
  action: string;
  remarks: string;
  datetime: string;
  project_type_info: {
    id: number;
    name: string;
    duration: number;
    level_id: number;
  };
  status_info: string;
  total_locality: number;
  age: number;
  station_info: {
    id: number;
    name: string;
  };
  current_task: string;
  funders: Array<{
    id: number;
    name: string;
    category: string;
  }>;
  localities: Array<{
    region: number | null;
    district: number | null;
    ward: number | null;
    village: number | null;
  }>;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  draft_projects: number;
  projects_by_type: Array<{
    type_name: string;
    count: number;
  }>;
  projects_by_status: Array<{
    status: string;
    count: number;
  }>;
}

export interface ProjectQueryParams {
  id?: string;
  type?: string;
  status?: string;
  search?: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
  reg_date: string;
  auth_date: string;
  budget: number;
  project_type: number;
  funders: number[];
  localities: Array<{
    region: number | null;
    district: number | null;
    ward: number | null;
    village: number | null;
  }>;
}

export const useProjectsQuery = (options: ProjectQueryParams) => {
  return useQuery({
    queryKey: options.id
      ? ["project", options.id]
      : ["projects", options],
    queryFn: async (): Promise<APIResponse<Project>> => {
      if (options.id) {
        // Fetch a single project by ID
        const response = await api.get<APIResponse<Project>>(`/projects/${options.id}`);
        return response.data;
      } else {
        // Fetch multiple projects with optional params
        const response = await api.get<APIResponse<Project>>(`/projects/list`, {
          params: options,
        });
        return response.data;
      }
    },
    enabled: !!options.id || !!options,
  });
};

export const useProjectStats = (organization_id?: string) => {
  return useQuery({
    queryKey: ['projectStats', organization_id],
    queryFn: async (): Promise<APIResponse<ProjectStats>> => {
      const response = await api.get(`/projects/stats?organization_id=${organization_id}`);
      return response.data;
    }
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectData: CreateProjectData): Promise<APIResponse<Project>> => {
      console.log('Creating project with data:', projectData);

      const response = await api.post<APIResponse<Project>>('/projects/create/', projectData);
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
    queryFn: async (): Promise<APIResponse<ProjectType>> => {
      const response = await api.get('/projects/public/project-types');
      return response.data;
    },
  });
};

export const useFunders = () => {
  return useQuery({
    queryKey: ['funders'],
    queryFn: async (): Promise<Funder[]> => {
      const response = await api.get('/setup/funders');
      console.log('Funders response:', response);
      return response.data;
    },
  });
};

export const useLevels = () => {
  return useQuery({
    queryKey: ['levels'],
    queryFn: async (): Promise<APIResponse<Level>> => {
      const response = await api.get('/localities/levels');
      return response.data;
    },
  });
};

export const useLocalities = () => {
  return useQuery({
    queryKey: ['localities'],
    queryFn: async (): Promise<APIResponse<Locality>> => {
      const response = await api.get('/localities/localities/');
      return response.data;
    },
  });
};