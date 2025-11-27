import { GRIIDashboardData, DashboardFilterOptions } from '@/types/grii-dashboard';

/**
 * Dashboard Service
 * Uses the existing useDashboardDataQuery hook for all data
 * No hardcoded values - all data is aggregated from real backend endpoints
 */
class DashboardService {
  /**
   * All dashboard data is now aggregated via useDashboardDataQuery hook
   * which fetches from existing module endpoints
   * @deprecated Use useDashboardDataQuery hook instead
   */
  async fetchDashboardData(_filters?: DashboardFilterOptions): Promise<GRIIDashboardData> {
    // This method is now handled by useDashboardDataQuery
    // which aggregates data from all existing module endpoints
    throw new Error('Use useDashboardDataQuery hook instead');
  }
}

export const dashboardService = new DashboardService();
