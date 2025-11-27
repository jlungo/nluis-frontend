import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ProjectI } from "@/types/projects";

export interface LocalityProjectsCheckI {
  has_land_use_project: boolean;
  has_ccro_project: boolean;
}

export const localityProjectsCheckQueryKey = "locality-projects-check";

/**
 * Check if a locality appears in any land use or CCRO projects
 * Searches through all projects to find if locality has been used
 */
export const useLocalityProjectsCheckQuery = (locality_id?: string) => {
  return useQuery<LocalityProjectsCheckI>({
    queryKey: [localityProjectsCheckQueryKey, locality_id],
    queryFn: async () => {
      if (!locality_id) {
        return { has_land_use_project: false, has_ccro_project: false };
      }

      try {
        // Fetch all land use projects
        const landUseRes = await api.get(`/projects/`, {
          params: { limit: 10000, offset: 0 } // Fetch all
        });

        const landUseProjects = landUseRes.data.results || [];
        
        // Check if this locality exists in any land use project
        const hasLandUseProject = landUseProjects.some((project: ProjectI) =>
          project.localities?.some((loc) => loc.locality__id === locality_id)
        );

        // Fetch all CCRO projects
        const ccroRes = await api.get(`/projects/`, {
          params: { limit: 10000, offset: 0 } // Fetch all
        });

        const ccroProjects = ccroRes.data.results || [];
        
        // Check if this locality exists in any CCRO project
        // Note: CCRO projects might be in a separate endpoint, but for now check same projects list
        const hasCCROProject = ccroProjects.some((project: ProjectI) =>
          project.localities?.some((loc) => loc.locality__id === locality_id)
        );

        return {
          has_land_use_project: hasLandUseProject,
          has_ccro_project: hasCCROProject,
        };
      } catch (error) {
        console.error('Error checking locality projects:', error);
        return { has_land_use_project: false, has_ccro_project: false };
      }
    },
    enabled: !!locality_id,
  });
};
