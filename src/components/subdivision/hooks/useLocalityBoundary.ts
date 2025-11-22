/**
 * Hook for managing locality boundary fetching and state
 */
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { fcToBounds } from '../utils/geometryHelpers';

export const useLocalityBoundary = (localityId?: string | number | null) => {
  const [localityBoundary, setLocalityBoundary] = useState<any>(null);
  const [localityBounds, setLocalityBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!localityId) {
      setLocalityBoundary(null);
      setLocalityBounds(null);
      return;
    }

    const fetchBoundary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/localities/localities/${localityId}/boundary/`);
        const boundaryData = response.data;
        setLocalityBoundary(boundaryData);
        
        const bounds = fcToBounds(boundaryData);
        setLocalityBounds(bounds);
      } catch (err) {
        console.error('Failed to fetch locality boundary:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLocalityBoundary(null);
        setLocalityBounds(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBoundary();
  }, [localityId]);

  return {
    localityBoundary,
    localityBounds,
    loading,
    error,
  };
};
