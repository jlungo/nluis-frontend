import api from '@/lib/axios';
import type { SubdivisionFeature } from '@/types/subdivision';

export const subdivisionService = {
  // Save a single subdivision
  async saveSubdivision(subdivision: SubdivisionFeature) {
    const { id } = subdivision.properties || {};
    if (!id) throw new Error('Subdivision ID is required');
    
    await api.patch(`/subdivisions/${id}`, subdivision);
  },

  // Save multiple subdivisions
  async saveSubdivisions(subdivisions: SubdivisionFeature[]) {
    await api.patch('/subdivisions/batch', { subdivisions });
  },

  // Save preferences (UI state that should persist)
  async savePreferences(preferences: {
    labelsVisible?: boolean;
    showZones?: boolean;
    showParcels?: boolean;
    parcelOpacity?: number;
    boundaryGlow?: boolean;
    leftPanelOpen?: boolean;
    rightPanelOpen?: boolean;
  }) {
    await api.post('/user/preferences/subdivision', preferences);
  },
};