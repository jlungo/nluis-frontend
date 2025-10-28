import { create } from 'zustand';
import { CCROApplication } from '@/types/ccro';
import { mockCCROApplications } from '@/mocks/ccroData';

interface CCROStore {
  applications: CCROApplication[];
  selectedApplication: CCROApplication | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setApplications: (applications: CCROApplication[]) => void;
  setSelectedApplication: (application: CCROApplication | null) => void;
  fetchApplications: () => Promise<void>;
}

export const useCCROStore = create<CCROStore>((set) => ({
  applications: [],
  selectedApplication: null,
  loading: false,
  error: null,

  setApplications: (applications) => set({ applications }),
  setSelectedApplication: (application) => set({ selectedApplication: application }),
  
  fetchApplications: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ applications: mockCCROApplications, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch applications', loading: false });
    }
  }
}));