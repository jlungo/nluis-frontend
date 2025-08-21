import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projects';
import type { 

  UpdateProjectRequest, 

  ProjectFilters,
  ProjectUser,

  CreateDocumentRequest,
  UpdateDocumentRequest,
  PatchedDocument,

  CreateSignatoryRequest,

  CreateTeamMemberRequest,
  AddTeamMemberRequest,

} from '@/types/projects';

// Helper function to create land-use specific filters
export const createLandUseFilters = (level?: string, additionalFilters?: Partial<ProjectFilters>): ProjectFilters => {
  const filters: ProjectFilters = {
    ...additionalFilters,
    // The API doesn't support direct type filtering in getProjects
    // We'll need to filter client-side or use a different approach
  };

  if (level) {
    filters.search = level; // Use search for level-specific filtering
  }

  return filters;
};

// Project queries
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.getProjects(filters),
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  });
};

export const useOrganizationProjects = (organizationId: string, filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['organization-projects', organizationId, filters],
    queryFn: () => projectService.getOrganizationProjects(organizationId, filters),
    enabled: !!organizationId,
  });
};

export const useProjectStats = (organizationId?: string) => {
  return useQuery({
    queryKey: ['project-stats', organizationId],
    queryFn: () => projectService.getProjectStats(organizationId),
  });
};

// Project Type queries
export const useProjectTypes = () => {
  return useQuery({
    queryKey: ['project-types'],
    queryFn: () => projectService.getProjectTypes(),
  });
};

// Project mutations
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectService.updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
    },
  });
};

// Project User queries
export const useProjectUsers = (projectId: string) => {
  return useQuery({
    queryKey: ['project-users', projectId],
    queryFn: () => projectService.getProjectUsers(projectId),
    enabled: !!projectId,
  });
};

export const useAssignUserToProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, userId, role }: { projectId: string; userId: string; role: ProjectUser['role'] }) =>
      projectService.assignUserToProject(projectId, userId, role),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-users', projectId] });
    },
  });
};

export const useRemoveUserFromProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectService.removeUserFromProject(projectId, userId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-users', projectId] });
    },
  });
};

// Document queries
export const useDocuments = (projectId: string, taskId?: string) => {
  return useQuery({
    queryKey: ['documents', projectId, taskId],
    queryFn: () => projectService.getDocuments(projectId, taskId),
    enabled: !!projectId,
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => projectService.getDocument(id),
    enabled: !!id,
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.createDocument,
    onSuccess: (_, variables: CreateDocumentRequest) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.project_id.toString()] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentRequest }) =>
      projectService.updateDocument(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
    },
  });
};

export const usePatchDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchedDocument }) =>
      projectService.patchDocument(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.deleteDocument,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', id] });
    },
  });
};

// Parcel queries
export const useParcels = (projectId: string, stage: string) => {
  return useQuery({
    queryKey: ['parcels', projectId, stage],
    queryFn: () => projectService.getParcels(projectId, stage),
    enabled: !!projectId && !!stage,
  });
};

export const useParcelInfo = (id: string) => {
  return useQuery({
    queryKey: ['parcel-info', id],
    queryFn: () => projectService.getParcelInfo(id),
    enabled: !!id,
  });
};

export const useParcelParties = (id: string) => {
  return useQuery({
    queryKey: ['parcel-parties', id],
    queryFn: () => projectService.getParcelParties(id),
    enabled: !!id,
  });
};

export const useSearchParcels = (projectId: string, search: string) => {
  return useQuery({
    queryKey: ['search-parcels', projectId, search],
    queryFn: () => projectService.searchParcels(projectId, search),
    enabled: !!projectId && !!search,
  });
};

// Team Member queries
export const useTeamMembers = (projectId: string) => {
  return useQuery({
    queryKey: ['team-members', projectId],
    queryFn: () => projectService.getTeamMembers(projectId),
    enabled: !!projectId,
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.addTeamMember,
    onSuccess: (_, variables: AddTeamMemberRequest) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.project_id.toString()] });
    },
  });
};

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.createTeamMember,
    onSuccess: (_, variables: CreateTeamMemberRequest) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.project_id.toString()] });
    },
  });
};

export const useTeamMemberHistory = (projectId: string) => {
  return useQuery({
    queryKey: ['team-member-history', projectId],
    queryFn: () => projectService.getTeamMemberHistory(projectId),
    enabled: !!projectId,
  });
};

// Signatory queries
export const useSignatories = (projectId: string) => {
  return useQuery({
    queryKey: ['signatories', projectId],
    queryFn: () => projectService.getSignatories(projectId),
    enabled: !!projectId,
  });
};

export const useCreateSignatory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.createSignatory,
    onSuccess: (_, variables: CreateSignatoryRequest) => {
      queryClient.invalidateQueries({ queryKey: ['signatories', variables.project_id.toString()] });
    },
  });
};

// Locality queries
export const useLocalities = (projectId: string) => {
  return useQuery({
    queryKey: ['localities', projectId],
    queryFn: () => projectService.getLocalities(projectId),
    enabled: !!projectId,
  });
};

// Monitoring queries
export const useMonitoringRecords = () => {
  return useQuery({
    queryKey: ['monitoring-records'],
    queryFn: () => projectService.getMonitoringRecords(),
  });
};

// Task Menu queries
export const useTaskMenu = (projectTypeId: string, projectId: string) => {
  return useQuery({
    queryKey: ['task-menu', projectTypeId, projectId],
    queryFn: () => projectService.getTaskMenu(projectTypeId, projectId),
    enabled: !!projectTypeId && !!projectId,
  });
};

// Public queries
export const usePublicProjectTypes = () => {
  return useQuery({
    queryKey: ['public-project-types'],
    queryFn: () => projectService.getPublicProjectTypes(),
  });
};

export const usePublishedProjects = () => {
  return useQuery({
    queryKey: ['published-projects'],
    queryFn: () => projectService.getPublishedProjects(),
  });
};

export const useProjectStatuses = () => {
  return useQuery({
    queryKey: ['project-statuses'],
    queryFn: () => projectService.getProjectStatuses(),
  });
};

export const useFilteredProjects = (projectTypeId: string, statusId: string, desc: string) => {
  return useQuery({
    queryKey: ['filtered-projects', projectTypeId, statusId, desc],
    queryFn: () => projectService.getFilteredProjects(projectTypeId, statusId, desc),
    enabled: !!projectTypeId && !!statusId && !!desc,
  });
};

// Land-use specific project queries
export const useLandUseProjects = (level?: string, additionalFilters?: Partial<ProjectFilters>) => {
  const filters = createLandUseFilters(level, additionalFilters);
  return useQuery({
    queryKey: ['land-use-projects', level, filters],
    queryFn: async () => {
      const allProjects = await projectService.getProjects(filters);
      // Filter client-side for land-use projects
      return allProjects.filter(project => 
        project.type.category === 'land-use'
      );
    },
  });
};

export const useVillageLandUseProjects = (additionalFilters?: Partial<ProjectFilters>) => {
  return useLandUseProjects('village', additionalFilters);
};

export const useDistrictLandUseProjects = (additionalFilters?: Partial<ProjectFilters>) => {
  return useLandUseProjects('district', additionalFilters);
};

export const useRegionalLandUseProjects = (additionalFilters?: Partial<ProjectFilters>) => {
  return useLandUseProjects('regional', additionalFilters);
};

export const useZonalLandUseProjects = (additionalFilters?: Partial<ProjectFilters>) => {
  return useLandUseProjects('zonal', additionalFilters);
};

export const useNationalLandUseProjects = (additionalFilters?: Partial<ProjectFilters>) => {
  return useLandUseProjects('national', additionalFilters);
};

// Land-use project statistics
export const useLandUseProjectStats = (organizationId?: string) => {
  return useQuery({
    queryKey: ['land-use-project-stats', organizationId],
    queryFn: async () => {
      const stats = await projectService.getProjectStats(organizationId);
      // Filter stats to only include land-use projects
      const landUseStats = {
        ...stats,
        projects_by_type: stats.projects_by_type?.filter(type => 
          type.type_name.toLowerCase().includes('land-use') || type.type_name.toLowerCase().includes('land use')
        ) || []
      };
      return landUseStats;
    },
  });
};
