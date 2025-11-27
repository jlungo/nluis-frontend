import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { localityPlanQueryKey } from '@/queries/useLocalityPlanQuery';
import api from '@/lib/axios';

export const PlanStatusColumn: ColumnDef<any> = {
  accessorKey: 'locality__id',
  header: 'Plan Status',
  cell: ({ row }) => {
    const localityId = row.original.locality__id;
    
    const { data: planData, isLoading } = useQuery<{ hasPlan: boolean; planCount: number }>({
      queryKey: [localityPlanQueryKey, localityId],
      queryFn: async () => {
        try {
          const response = await api.get(`/zoning/plans/?locality=${localityId}`);
          return {
            hasPlan: response.data?.length > 0,
            planCount: response.data?.length || 0
          };
        } catch (error) {
          console.error('Error checking plan status:', error);
          return { hasPlan: false, planCount: 0 };
        }
      },
      staleTime: 1000 * 60 * 2, // Cache for 2 minutes
      gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    });

    if (isLoading) {
      return (
        <Badge variant="outline" className="text-muted-foreground gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Checking...
        </Badge>
      );
    }

    if (planData?.hasPlan) {
      return (
        <Badge variant="default" className="bg-green-500/15 text-green-600 hover:bg-green-500/25 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {planData.planCount > 1 ? `${planData.planCount} Plans` : '1 Plan'}
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="text-red-600 gap-1">
        <XCircle className="w-3 h-3" />
        No Plan
      </Badge>
    );
  },
};