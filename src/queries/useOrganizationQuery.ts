import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/services/organizations';
import type { 
  Organization, 
  OrganizationType, 
  OrganizationFilters,
  PatchedOrganization,
  PatchedOrganizationType 
} from '@/types/organizations';

// Organization queries
export const useOrganizations = (filters?: OrganizationFilters) => {
  return useQuery({
    queryKey: ['organizations', filters],
    queryFn: () => organizationService.getOrganizations(filters),
  });
};

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationService.getOrganization(id),
    enabled: !!id,
  });
};

export const useOrganizationStats = () => {
  return useQuery({
    queryKey: ['organization-stats'],
    queryFn: () => organizationService.getStats(),
  });
};

// Organization Type queries
export const useOrganizationTypes = () => {
  return useQuery({
    queryKey: ['organization-types'],
    queryFn: () => organizationService.getOrganizationTypes(),
  });
};

export const useOrganizationType = (id: string) => {
  return useQuery({
    queryKey: ['organization-type', id],
    queryFn: () => organizationService.getOrganizationType(id),
    enabled: !!id,
  });
};

// Organization mutations
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: organizationService.createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization-stats'] });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Organization> }) =>
      organizationService.updateOrganization(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization', id] });
      queryClient.invalidateQueries({ queryKey: ['organization-stats'] });
    },
  });
};

export const usePartialUpdateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchedOrganization }) =>
      organizationService.partialUpdateOrganization(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization', id] });
      queryClient.invalidateQueries({ queryKey: ['organization-stats'] });
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: organizationService.deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization-stats'] });
    },
  });
};

// Organization Type mutations
export const useCreateOrganizationType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: organizationService.createOrganizationType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-types'] });
    },
  });
};

export const useUpdateOrganizationType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrganizationType> }) =>
      organizationService.updateOrganizationType(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['organization-types'] });
      queryClient.invalidateQueries({ queryKey: ['organization-type', id] });
    },
  });
};

export const usePartialUpdateOrganizationType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchedOrganizationType }) =>
      organizationService.partialUpdateOrganizationType(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['organization-types'] });
      queryClient.invalidateQueries({ queryKey: ['organization-type', id] });
    },
  });
};

export const useDeleteOrganizationType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: organizationService.deleteOrganizationType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-types'] });
    },
  });
};
