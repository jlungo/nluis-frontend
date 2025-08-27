import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { APIResponse } from '@/types/api-response';
import type { Organization } from '@/types/organizations';

export interface ApiUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string | null;
  organization: string | null;
  user_type: number;
  gender: number;
  last_login: string | null;
  created_at: string;
  is_verified: boolean;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  location: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  user_type: number | string;
  organization: string | null;
  organizationName?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  location: string;
  userType: number;
  gender: number;
}

interface UseUsersQueryProps {
  organizations?: Organization[];
}

export const useUsersQuery = ({ organizations = [] }: UseUsersQueryProps = {}) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const response = await api.get<APIResponse<ApiUser>>('/auth/users/');
      const users = response.data.results ?? [];

      return users.map((user) => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone || 'Not provided',
        role: user.role || 'No role assigned',
        organization: user.organization,
        user_type: user.user_type,
        organizationName: organizations.find(org => org.id === user.organization)?.name,
        status: user.status ?? 'active',
        emailVerified: user.is_verified ?? false,
        lastLogin: user.last_login || 'Unknown',
        createdAt: user.created_at,
        location: user.location || 'Unknown',
        userType: user.user_type,
        gender: user.gender
      }));
    }
  });
};
