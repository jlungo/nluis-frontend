import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { APIResponse } from "@/types/api-response";

export interface Project {
  id: number;
  name: string;
  reg_date: string;
  auth_date: string;
  published_date: string;
  action: string;
  remarks: string;
  datetime: string;
  project_type_info: {
    id: number;
    name: string;
    duration: number;
  };
  status_info: string[];
  total_locality: number;
  age: number;
  station_info: {
    id: number;
    name: string;
  };
  current_task: string;
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
      const response =  await api.get(`/projects/stats?organization_id=${organization_id}`);
      return response.data;
    }
  });
};
