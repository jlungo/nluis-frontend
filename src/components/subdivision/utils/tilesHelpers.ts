/**
 * Map tiles and API URL utilities
 */
import api from '@/lib/axios';

/**
 * Get the base API URL without trailing slash
 */
export const getAPIBase = (): string => {
  return (api.defaults.baseURL || '').replace(/\/$/, '');
};

/**
 * Get the plans tiles MVT endpoint URL
 */
export const getPlansTilesTemplate = (localityId?: string | number | null): string | null => {
  if (!localityId) return null;
  
  const API_BASE = getAPIBase();
  return `${API_BASE}/zoning/plans/latest/${localityId}/tiles/{z}/{x}/{y}.mvt`;
};

/**
 * Get plans source configuration
 */
export const getPlansTilesSource = (localityId?: string | number | null) => {
  if (!localityId) return null;
  
  const API_BASE = getAPIBase();
  return {
    id: 'plans-tiles' as const,
    type: 'vector' as const,
    tiles: [`${API_BASE}/zoning/plans/latest/${localityId}/tiles/{z}/{x}/{y}.mvt`],
    minzoom: 1,
    maxzoom: 22,
    promoteId: 'id' as const,
  };
};

/**
 * Check if a URL is an API call
 */
export const isApiUrl = (url: string): boolean => {
  if (typeof url !== 'string') return false;
  
  const API_BASE = getAPIBase();
  const bare = API_BASE.replace(/^https?:\/\//, '');
  
  return url.startsWith(API_BASE) || url.startsWith(bare);
};

/**
 * Invalidate tiles for a source
 */
export const invalidateTiles = (map: any, sourceId: string = 'plans-tiles'): void => {
  if (!map || !map.isStyleLoaded?.()) return;
  
  try {
    const src: any = map.getSource?.(sourceId);
    if (src?.setTiles) {
      // Get current tiles and add cache-bust param
      const tiles = src.tiles || [];
      const newTiles = tiles.map((tile: string) => {
        const [base] = tile.split('?');
        return `${base}?v=${Date.now()}`;
      });
      src.setTiles(newTiles);
    } else {
      map.triggerRepaint?.();
    }
  } catch {}
};

/**
 * Refresh tiles for specific locality
 */
export const refreshLocalityTiles = (map: any, localityId?: string | number | null): void => {
  if (!localityId) return;
  
  const template = getPlansTilesTemplate(localityId);
  if (!template) return;
  
  invalidateTiles(map, 'plans-tiles');
};
