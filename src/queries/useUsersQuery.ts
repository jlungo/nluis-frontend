import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { APIResponse } from '@/types/api-response';
import type { OrganizationI } from '@/types/organizations';

export interface UserType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  organization?: string;
  user_type: number;
  gender: number;
  last_login?: string;
  created_at: string;
  is_verified: boolean;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  location: string;
}

interface UseUsersQueryProps {
  organizations?: OrganizationI[];
}

export const useUsersQuery = ({ organizations = [] }: UseUsersQueryProps = {}) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserType[]> => {
      const response = await api.get<APIResponse<UserType>>('/auth/users/');
      const users = response.data.results ?? [];

      return users.map((user) => ({
        ...user,
        organization_name: organizations.find(org => org.id === user.organization)?.name,
      }));
    }
  });
};
