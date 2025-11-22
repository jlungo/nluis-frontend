import { create } from 'zustand';
import { CCROApplication } from '@/types/ccro';
import api from '@/lib/axios';

interface CCROStore {
  applications: CCROApplication[];
  selectedApplication: CCROApplication | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setApplications: (applications: CCROApplication[]) => void;
  setSelectedApplication: (application: CCROApplication | null) => void;
  fetchApplications: (filters?: Record<string, any>) => Promise<void>;
  fetchApplicationDetail: (id: number) => Promise<void>;
  verifyPartyNida: (partyId: number) => Promise<void>;
  checkNidaStatus: (applicationId: number) => Promise<void>;
  approveCCRO: (applicationId: number) => Promise<void>;
  issueCCRO: (applicationId: number) => Promise<void>;
}

export const useCCROStore = create<CCROStore>((set, get) => ({
  applications: [],
  selectedApplication: null,
  loading: false,
  error: null,

  setApplications: (applications) => set({ applications }),
  setSelectedApplication: (application) => set({ selectedApplication: application }),
  
  // Fetch CCRO applications with filters (for office review)
  fetchApplications: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      
      // Default: show submitted/review applications (office workflow)
      if (!params.has('stage') && !params.has('blocked_by_nida') && !params.has('my_assignments')) {
        params.append('stage', 'submitted');
      }
      
      const response = await api.get(`/ccro/ccro-applications/?${params}`);
      const data = response.data;
      const applications = Array.isArray(data) ? data : data.results || [];
      
      set({ applications, loading: false });
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'Failed to fetch applications';
      console.error('CCRO fetch error:', message);
      set({ error: message, loading: false });
    }
  },
  
  // Fetch single application details (with full serializer)
  fetchApplicationDetail: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/ccro/ccro-applications/${id}/`);
      set({ selectedApplication: response.data, loading: false });
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'Failed to fetch application';
      console.error('CCRO detail fetch error:', message);
      set({ error: message, loading: false });
    }
  },
  
  // Verify NIDA for a party
  verifyPartyNida: async (partyId: number) => {
    set({ error: null });
    try {
      await api.post(`/ccro/parties/${partyId}/verify_nida/`);
      
      // Refresh selected application to show updated verification status
      const app = get().selectedApplication;
      if (app) {
        await get().fetchApplicationDetail(app.id);
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'Failed to verify NIDA';
      set({ error: message });
      throw error;
    }
  },
  
  // Recheck NIDA status for application
  checkNidaStatus: async (applicationId: number) => {
    set({ error: null });
    try {
      await api.post(`/ccro/ccro-applications/${applicationId}/check_nida/`);
      
      // Refresh application
      await get().fetchApplicationDetail(applicationId);
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'Failed to check NIDA status';
      set({ error: message });
      throw error;
    }
  },
  
  // Approve CCRO application
  approveCCRO: async (applicationId: number) => {
    set({ error: null });
    try {
      await api.post(`/ccro/ccro-applications/${applicationId}/approve/`);
      
      // Refresh application
      await get().fetchApplicationDetail(applicationId);
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.response?.data?.reason || error?.message || 'Failed to approve CCRO';
      set({ error: message });
      throw error;
    }
  },
  
  // Issue CCRO certificates
  issueCCRO: async (applicationId: number) => {
    set({ error: null });
    try {
      await api.post(`/ccro/ccro-applications/${applicationId}/issue_ccro/`);
      
      // Refresh application
      await get().fetchApplicationDetail(applicationId);
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.response?.data?.reason || error?.message || 'Failed to issue CCRO';
      set({ error: message });
      throw error;
    }
  },
}));