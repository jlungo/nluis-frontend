/**
 * Plans layers component for Mapbox map
 */
import { Source, Layer } from 'react-map-gl/mapbox';
import { getPlansTilesSource } from '../utils/tilesHelpers';

interface PlansLayersProps {
  localityId?: string | number | null;
  plansOpacity: number;
  colorMode: string;
  showPlans: boolean;
}

export function PlansLayers({
  localityId,
  plansOpacity,
  colorMode,
  showPlans,
}: PlansLayersProps) {
  if (!localityId || !showPlans) return null;

  const source = getPlansTilesSource(localityId);
  if (!source) return null;

  return (
    <Source 
      id={source.id}
      type={source.type}
      tiles={source.tiles}
      minzoom={source.minzoom}
      maxzoom={source.maxzoom}
      promoteId={source.promoteId}
    >
      <Layer
        id="plans-fill"
        type="fill"
        source-layer="zones"
        paint={{
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#10b981',
            [
              'case',
              ['==', ['literal', colorMode], 'status'],
              ['case', ['to-boolean', ['get', 'can_be_subdivided']], '#10b981', '#9ca3af'],
              ['coalesce', ['get', 'color'], '#6b7280']
            ]
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.7,
            ['boolean', ['feature-state', 'hover'], false],
            Math.max(0.05, Math.min(1, plansOpacity || 0.6)),
            Math.max(0.05, Math.min(1, plansOpacity || 0.45)),
          ],
        }}
      />
      <Layer
        id="plans-line"
        type="line"
        source-layer="zones"
        paint={{
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#059669',
            ['boolean', ['feature-state', 'hover'], false],
            '#374151',
            '#1f2937',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            3,
            ['boolean', ['feature-state', 'hover'], false],
            2,
            1.5,
          ],
          'line-opacity': 0.95,
        }}
      />
    </Source>
  );
}
