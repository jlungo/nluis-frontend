/**
 * Hook for managing tile error handling and token refresh
 */
import { useEffect } from 'react';
import { refreshAccessToken } from '@/lib/axios';
import { invalidateTiles } from '../utils/tilesHelpers';

export const useTileErrorHandler = (
  getMap: () => any,
  getPlansTilesTemplate: () => string | null
) => {
  useEffect(() => {
    const m = getMap();
    if (!m) return;

    const onError = async (e: any) => {
      const status = e?.error?.status || e?.error?.cause?.status;

      if (status === 401) {
        try {
          await refreshAccessToken();
          invalidateTiles(m, 'plans-tiles');
        } catch {}
        return;
      }
    };

    m.on('error', onError);
    return () => {
      try {
        m.off('error', onError);
      } catch {}
    };
  }, [getMap, getPlansTilesTemplate]);
};
