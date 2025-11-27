import { create } from 'zustand';
import {
  GRIIDashboardData,
  DashboardFilterOptions,
  DashboardAlert,
  DashboardView,
} from '@/types/grii-dashboard';

interface DashboardState {
  // Data
  dashboardData: GRIIDashboardData | null;
  filters: DashboardFilterOptions;
  alerts: DashboardAlert[];
  views: DashboardView[];
  currentView: DashboardView | null;
  selectedView: string | null;

  // UI State
  loading: boolean;
  error: string | null;
  autoRefresh: boolean;
  refreshInterval: number;

  // Actions
  fetchDashboardData: () => Promise<void>;
  setFilters: (filters: DashboardFilterOptions) => void;
  clearFilters: () => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  addAlert: (alert: DashboardAlert) => void;
  removeAlert: (alertId: string) => void;
  clearAlerts: () => void;
  saveView: (view: DashboardView) => void;
  loadView: (viewId: string) => void;
  deleteView: (viewId: string) => void;
  getAlertsByLevel: (level: 'critical' | 'warning' | 'info') => DashboardAlert[];
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  dashboardData: null,
  filters: {},
  alerts: [],
  views: [],
  currentView: null,
  selectedView: null,
  loading: false,
  error: null,
  autoRefresh: false,
  refreshInterval: 3600,

  // Actions
  fetchDashboardData: async () => {
    // Dashboard data is now fetched via useDashboardDataQuery hook
    // This method is kept for backwards compatibility but is no longer used
    set({ loading: false, error: null });
  },

  setFilters: (filters: DashboardFilterOptions) => {
    set({ filters });
    // Optionally trigger data refresh
    get().fetchDashboardData();
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setAutoRefresh: (enabled: boolean) => {
    set({ autoRefresh: enabled });
  },

  setRefreshInterval: (interval: number) => {
    set({ refreshInterval: interval });
  },

  addAlert: (alert: DashboardAlert) => {
    set((state) => ({
      alerts: [...state.alerts, alert],
    }));
  },

  removeAlert: (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== alertId),
    }));
  },

  clearAlerts: () => {
    set({ alerts: [] });
  },

  saveView: (view: DashboardView) => {
    set((state) => ({
      views: [...state.views.filter((v) => v.id !== view.id), view],
    }));
  },

  loadView: (viewId: string) => {
    const state = get();
    const view = state.views.find((v) => v.id === viewId);
    if (view) {
      set({
        currentView: view,
        selectedView: viewId,
        filters: view.filters,
      });
    }
  },

  deleteView: (viewId: string) => {
    set((state) => ({
      views: state.views.filter((v) => v.id !== viewId),
      selectedView: state.selectedView === viewId ? null : state.selectedView,
      currentView: state.currentView?.id === viewId ? null : state.currentView,
    }));
  },

  getAlertsByLevel: (level: 'critical' | 'warning' | 'info') => {
    return get().alerts.filter((a) => a.level === level);
  },
}));
