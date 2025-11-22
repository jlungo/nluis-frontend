import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useLocalityPlanQuery = (localityId?: string | null) => {
  return useQuery<boolean>({
    queryKey: ['locality-plan', localityId],
    queryFn: async () => {
      if (!localityId) return false;
      try {
        await api.get(`/localities/localities/${localityId}/boundary/`).then((r) => r.data);
        // treat presence of boundary as proxy for plan
        return true;
      } catch (e) {
        return false;
      }
    },
    enabled: !!localityId,
    staleTime: 1000 * 60 * 2,
  });
};

export default useLocalityPlanQuery;
