import api from "@/lib/axios";
import type { Region, District, Ward, Village, LocationFilters } from "@/types/locations";

const BASE_URL = "/location";

export const locationService = {
  // Get all regions
  getRegions: async (filters?: LocationFilters) => {
    const response = await api.get<Region[]>(`${BASE_URL}/regions/`, { params: filters });
    return response.data;
  },

  // Get districts by region
  getDistricts: async (filters?: LocationFilters) => {
    const response = await api.get<District[]>(`${BASE_URL}/districts/`, { params: filters });
    return response.data;
  },

  // Get districts for a specific region
  getDistrictsByRegion: async (regionId: string) => {
    const response = await api.get<District[]>(`${BASE_URL}/districts/`, { 
      params: { region_id: regionId } 
    });
    return response.data;
  },

  // Get wards by district
  getWards: async (filters?: LocationFilters) => {
    const response = await api.get<Ward[]>(`${BASE_URL}/wards/`, { params: filters });
    return response.data;
  },

  // Get wards for a specific district
  getWardsByDistrict: async (districtId: string) => {
    const response = await api.get<Ward[]>(`${BASE_URL}/wards/`, { 
      params: { district_id: districtId } 
    });
    return response.data;
  },

  // Get villages by ward
  getVillages: async (filters?: LocationFilters) => {
    const response = await api.get<Village[]>(`${BASE_URL}/villages/`, { params: filters });
    return response.data;
  },

  // Get villages for a specific ward
  getVillagesByWard: async (wardId: string) => {
    const response = await api.get<Village[]>(`${BASE_URL}/villages/`, { 
      params: { ward_id: wardId } 
    });
    return response.data;
  },

  // Get single location entities
  getRegion: async (id: string) => {
    const response = await api.get<Region>(`${BASE_URL}/regions/${id}/`);
    return response.data;
  },

  getDistrict: async (id: string) => {
    const response = await api.get<District>(`${BASE_URL}/districts/${id}/`);
    return response.data;
  },

  getWard: async (id: string) => {
    const response = await api.get<Ward>(`${BASE_URL}/wards/${id}/`);
    return response.data;
  },

  getVillage: async (id: string) => {
    const response = await api.get<Village>(`${BASE_URL}/villages/${id}/`);
    return response.data;
  }
};