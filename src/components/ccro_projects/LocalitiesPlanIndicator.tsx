import React, { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Loader2, CheckCircle, AlertTriangle, X as XIcon } from 'lucide-react';
import api from '@/lib/axios';

type LocalityRow = {
  locality__id: string;
  locality__name: string;
};

interface Props {
  localities?: LocalityRow[] | null;
}

/**
 * LocalitiesPlanIndicator
 * -----------------------
 * Checks whether each locality has a finalized plan.
 * Displays the count of localities with and without plans.
 */
export const LocalitiesPlanIndicator: React.FC<Props> = ({ localities }) => {
  const ids = useMemo(() => (localities || []).map((l) => l.locality__id), [localities]);

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['locality-latest-plan', id],
      queryFn: async () => {
        try {
          const response = await api.get(`/api/v1/zoning/plans/latest/${id}/`);
          return {
            hasPlan: !!response.data,
            plan: response.data,
          };
        } catch (error: any) {
          if (error?.response?.status === 404) {
            return { hasPlan: false, plan: null };
          }
          throw error;
        }
      },
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 5,    // 5 minutes
      enabled: !!id,
      retry: 1,
    })),
  });

  if (!ids.length) {
    return <span className="text-sm text-muted-foreground">No localities</span>;
  }

  const anyLoading = queries.some((q) => q.isLoading);
  const anyError = queries.some((q) => q.isError);
  const results = queries.map((q) => q.data ?? { hasPlan: false });

  const total = results.length;
  const ok = results.filter((r) => r.hasPlan).length;
  const missing = total - ok;

  if (anyLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="animate-spin h-4 w-4 text-gray-500" />
        <span className="text-xs text-muted-foreground">Checking plans...</span>
      </div>
    );
  }

  if (anyError) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Error loading plans</span>
      </div>
    );
  }

  if (ok === total) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">All {total} localities have plans</span>
      </div>
    );
  }

  if (ok === 0) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XIcon className="h-4 w-4" />
        <span className="text-sm font-medium">None of the {total} localities have plans</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-amber-600">
      <AlertTriangle className="h-4 w-4" />
      <span className="text-sm font-medium">
        {ok} have plans, {missing} don’t
      </span>
    </div>
  );
};

export default LocalitiesPlanIndicator;
