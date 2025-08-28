import api from "@/lib/axios";
import type { 
  OrganizationI, 
  OrganizationType, 
  OrganizationStats, 
  OrganizationFilters,
  PatchedOrganization,
  PatchedOrganizationType 
} from "@/types/organizations";

const Modal = "/organization";

export const organizationService = {
  // List organizations with optional filters
  getOrganizations: async (filters?: OrganizationFilters) => {
    const response = await api.get<OrganizationI[]>(Modal, { params: filters });
    return response.data;
  },

  // Get organization statistics
  getStats: async () => {
    const response = await api.get<OrganizationStats>(`${Modal}/stats`);
    return response.data;
  },

  // Get a single organization by ID
  getOrganization: async (id: string) => {
    const response = await api.get<OrganizationI>(`${Modal}/${id}/`);
    return response.data;
  },

  // Create a new organization
  createOrganization: async (data: Partial<OrganizationI>) => {
    const response = await api.post<OrganizationI>(`${Modal}/create/`, data);
    return response.data;
  },

  // Update an existing organization (PUT)
  updateOrganization: async (id: string, data: Partial<OrganizationI>) => {
    const response = await api.put<OrganizationI>(`${Modal}/${id}/`, data);
    return response.data;
  },

  // Partial update an existing organization (PATCH)
  partialUpdateOrganization: async (id: string, data: PatchedOrganization) => {
    const response = await api.patch<OrganizationI>(`${Modal}/${id}/`, data);
    return response.data;
  },

  // Delete an organization
  deleteOrganization: async (id: string) => {
    await api.delete(`${Modal}/${id}/delete/`);
  },

  // Get all organization types
  getOrganizationTypes: async () => {
    const response = await api.get<OrganizationType[]>(`${Modal}/organization-types/`);
    return response.data;
  },

  // Get a single organization type by ID
  getOrganizationType: async (id: string) => {
    const response = await api.get<OrganizationType>(`${Modal}/organization-types/${id}/`);
    return response.data;
  },

  // Create a new organization type
  createOrganizationType: async (data: Partial<OrganizationType>) => {
    const response = await api.post<OrganizationType>(`${Modal}/organization-types/create/`, data);
    return response.data;
  },

  // Update an existing organization type (PUT)
  updateOrganizationType: async (id: string, data: Partial<OrganizationType>) => {
    const response = await api.put<OrganizationType>(`${Modal}/organization-types/${id}/`, data);
    return response.data;
  },

  // Partial update an existing organization type (PATCH)
  partialUpdateOrganizationType: async (id: string, data: PatchedOrganizationType) => {
    const response = await api.patch<OrganizationType>(`${Modal}/organization-types/${id}/`, data);
    return response.data;
  },

  // Delete an organization type
  deleteOrganizationType: async (id: string) => {
    await api.delete(`${Modal}/organization-types/${id}/delete/`);
  }
};
