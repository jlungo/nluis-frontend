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
      const sourceId = e?.sourceId || e?.error?.sourceId;
      const url = e?.error?.url || e?.url;

      console.error('🗺️ Map Tile Error:', {
        status,
        sourceId,
        url,
        message: e?.error?.message || e?.message,
        fullError: e
      });

      if (status === 401) {
        console.log('🔐 Tile auth error (401), refreshing token...');
        try {
          await refreshAccessToken();
          invalidateTiles(m, 'plans-tiles');
          console.log('✅ Token refreshed, tiles invalidated');
        } catch (refreshError) {
          console.error('❌ Failed to refresh token:', refreshError);
        }
        return;
      }

      // Log other common errors
      if (status === 404) {
        console.error('❌ Tile not found (404). Check if the backend endpoint exists:', url);
      } else if (status === 403) {
        console.error('❌ Tile forbidden (403). Check permissions for:', url);
      } else if (!status) {
        console.error('❌ Network or CORS error. URL:', url);
      }
    };

    const onSourceData = (e: any) => {
      if (e.sourceId === 'plans-tiles' && e.isSourceLoaded) {
        console.log('✅ Plans tiles source loaded successfully', {
          sourceId: e.sourceId,
          tile: e.tile
        });
      }
    };

    const onStyleData = () => {
      const source = m.getSource?.('plans-tiles');
      if (source) {
        console.log('🗺️ Plans tiles source exists after style load');
      }
    };

    m.on('error', onError);
    m.on('sourcedata', onSourceData);
    m.on('styledata', onStyleData);

    return () => {
      try {
        m.off('error', onError);
        m.off('sourcedata', onSourceData);
        m.off('styledata', onStyleData);
      } catch { }
    };
  }, [getMap, getPlansTilesTemplate]);
};
