/**
 * Hook for managing authorization and tile request transformations
 */
import { useCallback } from 'react';
import { getAccessToken } from '@/lib/axios';
import { getAPIBase, isApiUrl } from '../utils/tilesHelpers';

export const useMapRequestTransform = () => {
  const transformRequest = useCallback((url: string) => {
    if (!isApiUrl(url)) {
      return { url };
    }

    const token = getAccessToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return { url, headers };
  }, []);

  return transformRequest;
};
