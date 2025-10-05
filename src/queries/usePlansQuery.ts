import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

// Plans: land-use plans list (metadata). Used by subdivision components.
export const usePlansQuery = (params?: { locality?: string | number } | null) =>
  useQuery({
    queryKey: ['plans', params],
    queryFn: async () => {
  // call the zoning plans list endpoint relative to API base
  const response = await api.get('/zoning/plans/', { params: { locality: params?.locality } });
      return response.data;
    },
    // enable only when locality provided to avoid broad fetches
    enabled: !!params?.locality,
  });

type PlanDetailArg = string | number | { locality?: string | number } | undefined | null;

export const usePlanDetailQuery = (arg?: PlanDetailArg) =>
  useQuery({
    queryKey: ['plan', arg],
    enabled: !!(arg && (typeof arg === 'object' ? (arg as any).locality : arg)),
    queryFn: async () => {
      if (!arg) throw new Error('No id or locality provided');
      if (typeof arg === 'object') {
        const locality = (arg as any).locality;
        if (!locality) throw new Error('No locality provided');
        // call latest plan for locality relative to API base
        const res = await api.get(`/zoning/plans/latest/${locality}/`);
        return res.data;
      }
      const res = await api.get(`/zoning/plans/${arg}/`);
      return res.data;
    },
  });

export default usePlansQuery;
