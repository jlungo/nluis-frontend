import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const localityPlanQueryKey = 'locality-plan-query';

/**
 * Query hook to check if a locality has an associated plan
 */
export const useLocalityPlanQuery = (localityId?: string | number) => {
  return useQuery({
    queryKey: [localityPlanQueryKey, localityId],
    queryFn: async () => {
      if (!localityId) throw new Error('No locality ID provided');
      try {
        const response = await api.get(`/zoning/plans/?locality=${localityId}`);
        // If we get a successful response with plans data
        return {
          hasPlan: response.data?.length > 0,
          plans: response.data || []
        };
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return { hasPlan: false, plans: [] };
        }
        throw error;
      }
    },
    enabled: !!localityId,
  });
};
