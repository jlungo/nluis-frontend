import api from "@/lib/axios";
import type { 
  Organization, 
  OrganizationType, 
  OrganizationStats, 
  OrganizationFilters,
  PatchedOrganization,
  PatchedOrganizationType 
} from "@/types/organizations";

const BASE_URL = "/organization";

export const organizationService = {
  // List organizations with optional filters
  getOrganizations: async (filters?: OrganizationFilters) => {
    const response = await api.get<Organization[]>(BASE_URL, { params: filters });
    return response.data;
  },

  // Get organization statistics
  getStats: async () => {
    const response = await api.get<OrganizationStats>(`${BASE_URL}/stats`);
    return response.data;
  },

  // Get a single organization by ID
  getOrganization: async (id: string) => {
    const response = await api.get<Organization>(`${BASE_URL}/${id}/`);
    return response.data;
  },

  // Create a new organization
  createOrganization: async (data: Partial<Organization>) => {
    const response = await api.post<Organization>(`${BASE_URL}/create/`, data);
    return response.data;
  },

  // Update an existing organization (PUT)
  updateOrganization: async (id: string, data: Partial<Organization>) => {
    const response = await api.put<Organization>(`${BASE_URL}/${id}/`, data);
    return response.data;
  },

  // Partial update an existing organization (PATCH)
  partialUpdateOrganization: async (id: string, data: PatchedOrganization) => {
    const response = await api.patch<Organization>(`${BASE_URL}/${id}/`, data);
    return response.data;
  },

  // Delete an organization
  deleteOrganization: async (id: string) => {
    await api.delete(`${BASE_URL}/${id}/delete/`);
  },

  // Get all organization types
  getOrganizationTypes: async () => {
    const response = await api.get<OrganizationType[]>(`${BASE_URL}/organization-types/`);
    return response.data;
  },

  // Get a single organization type by ID
  getOrganizationType: async (id: string) => {
    const response = await api.get<OrganizationType>(`${BASE_URL}/organization-types/${id}/`);
    return response.data;
  },

  // Create a new organization type
  createOrganizationType: async (data: Partial<OrganizationType>) => {
    const response = await api.post<OrganizationType>(`${BASE_URL}/organization-types/create/`, data);
    return response.data;
  },

  // Update an existing organization type (PUT)
  updateOrganizationType: async (id: string, data: Partial<OrganizationType>) => {
    const response = await api.put<OrganizationType>(`${BASE_URL}/organization-types/${id}/`, data);
    return response.data;
  },

  // Partial update an existing organization type (PATCH)
  partialUpdateOrganizationType: async (id: string, data: PatchedOrganizationType) => {
    const response = await api.patch<OrganizationType>(`${BASE_URL}/organization-types/${id}/`, data);
    return response.data;
  },

  // Delete an organization type
  deleteOrganizationType: async (id: string) => {
    await api.delete(`${BASE_URL}/organization-types/${id}/delete/`);
  }
};
