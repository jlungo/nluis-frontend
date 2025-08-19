import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Organization {
  id: string;
  name: string;
  short_name: string;
  url: string;
  type: string;
  level: number;
}

// Unique key for this query
export const organizationsQueryKey = "organizations";

export const useOrganizationsQuery = () => {
  return useQuery<Organization[]>({
    queryKey: [organizationsQueryKey],
    queryFn: async () => {
      try {
        const response = await api.get<Organization[]>(`/organization/organizations`);
        return response.data;
      } catch (error) {
        return [];
      }
    },
  });
};
