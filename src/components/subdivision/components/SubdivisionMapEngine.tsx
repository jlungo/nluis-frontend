import { useEffect, useMemo } from 'react';
import { useLocalityShapefileQuery } from '@/queries/useLocalityQuery';
import useSubdivisionStore from '../store/useSubdivisionStore';
import { usePlansQuery } from '@/queries/usePlansQuery';

interface Props {
  localityId?: string | number | null;
  parentParcel?: any;
  disabled?: boolean;
}

// Lightweight, interactive SVG map engine for quick testing.
// - Renders locality boundary (if available)
// - Fetches plans for the locality via `/zoning/plans/?locality=` if present, otherwise no plans
// - Clicking a plan toggles selection in the subdivision store
export default function SubdivisionMapEngine({ localityId, parentParcel, disabled }: Props) {
  const { data: boundary } = useLocalityShapefileQuery(localityId ? String(localityId) : undefined as any);
  const togglePlan = useSubdivisionStore((s) => s.togglePlan);

  // Use react-query hook to fetch plans (land-use plans) for the locality
  const { data: plansResponse, isLoading } = usePlansQuery(localityId ? { locality: localityId } : null);

  // Convert the response into a GeoJSON FeatureCollection if necessary
  const plansGeo = (() => {
    if (!plansResponse) return null as any;
    if (plansResponse.features) return plansResponse;
    if (Array.isArray(plansResponse)) {
      return { type: 'FeatureCollection', features: plansResponse.map((p: any) => ({ type: 'Feature', geometry: p.geometry, properties: p })) };
    }
    // Unknown shape, return null
    return null as any;
  })();

  // When plansGeo changes, set up plan features
  useEffect(() => {
    if (!plansGeo) return;
  }, [plansGeo]);

  // This is a lightweight component - API setup is handled by MapViewer

  // Compute bounds from either boundary or plansGeo
  const geo = boundary || plansGeo;
  const bounds = useMemo(() => {
    if (!geo) return null;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    function visit(coords: any) {
      if (typeof coords[0] === 'number') {
        const x = coords[0];
        const y = coords[1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      } else {
        for (const c of coords) visit(c);
      }
    }
    const feats = geo?.features || [];
    for (const f of feats) {
      if (f?.geometry?.coordinates) {
        visit(f.geometry.coordinates);
      }
    }
    if (!isFinite(minX)) return null;
    return { minX, minY, maxX, maxY };
  }, [geo]);

  function project(lon: number, lat: number, w: number, h: number) {
    if (!bounds) return { x: 0, y: 0 };
    const { minX, maxX, minY, maxY } = bounds as any;
    const x = ((lon - minX) / (maxX - minX || 1)) * w;
    const y = ((maxY - lat) / (maxY - minY || 1)) * h;
    return { x, y };
  }

  function ringToPath(ring: number[][], w: number, h: number) {
    return ring
      .map((pt, i) => {
        const { x, y } = project(pt[0], pt[1], w, h);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ') + ' Z';
  }

  function polygonToPaths(coords: any, w: number, h: number) {
    return coords.map((ring: any) => ringToPath(ring, w, h));
  }

  const svgW = 700;
  const svgH = 480;

  return (
    <div className="w-full h-full p-2">
      <div className="p-2 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Subdivision Map</h4>
          <div className="text-xs text-muted-foreground">Lightweight interactive preview</div>
        </div>
  <div className="text-xs text-muted-foreground">{isLoading ? 'Loading…' : ''}</div>
      </div>

      <div className="w-full h-[420px] bg-white rounded overflow-hidden shadow-sm">
        {!geo ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">No map data</div>
        ) : (
          <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
            <rect x={0} y={0} width={svgW} height={svgH} fill="transparent" />
            <g>
              {(geo.features || []).map((f: any, fi: number) => {
                const geom = f.geometry;
                let paths: string[] = [];
                if (geom.type === 'Polygon') paths = polygonToPaths(geom.coordinates, svgW, svgH);
                else if (geom.type === 'MultiPolygon') {
                  for (const poly of geom.coordinates) paths = paths.concat(polygonToPaths(poly, svgW, svgH));
                }
                const zoneId = String(f.properties?.id ?? f.properties?.plan_id ?? f.properties?.pk ?? fi);
                const fill = f.properties?.color ?? f.properties?.fill ?? '#e6f0ff';
                return paths.map((p, i) => (
                  <path
                    key={`${fi}-${i}`}
                    d={p}
                    fill={fill}
                    stroke="#111827"
                    strokeWidth={0.6}
                    opacity={0.9}
                    onClick={() => {
                      if (disabled) return;
                      togglePlan(zoneId);
                    }}
                    role="button"
                    aria-label={`plan-${zoneId}`}
                  />
                ));
              })}
              {/* Render parent parcel geometry if provided */}
              {parentParcel?.geometry && (() => {
                const geom = parentParcel.geometry;
                const paths: string[] = [];
                if (geom.type === 'Polygon') {
                  paths.push(...polygonToPaths(geom.coordinates, svgW, svgH));
                } else if (geom.type === 'MultiPolygon') {
                  for (const poly of geom.coordinates) paths.push(...polygonToPaths(poly, svgW, svgH));
                }
                return paths.map((p, i) => (
                  <path key={`parent-${i}`} d={p} fill="none" stroke="#ef4444" strokeWidth={1} />
                ));
              })()}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}
