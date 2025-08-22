import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Role {
  id: string;
  privileges: string[];
  name: string;
  code: string;
  alias: string;
}

// Unique key for this query
export const rolesQueryKey = "roles";

export const useRolesQuery = () => {
  return useQuery<Role[]>({
    queryKey: [rolesQueryKey],
    queryFn: async () => {
      try {
        const response = await api.get<Role[]>(`/auth/roles`);
        return response.data;
      } catch (error) {
        return [];
      }
    },
  });
};
