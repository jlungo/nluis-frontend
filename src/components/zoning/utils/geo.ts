export const closeRing = (ring: number[][]) => {
  if (!ring?.length) return ring;
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  return fx === lx && fy === ly ? ring : [...ring, ring[0]];
};

export const ensureMultiPolygon = (geometry: any) => {
  if (!geometry) return geometry;
  if (geometry.type === "Polygon") {
    const coords = (geometry.coordinates || []).map(closeRing);
    return { type: "MultiPolygon", coordinates: [coords] };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: (geometry.coordinates || []).map((poly: number[][][]) =>
        poly.map(closeRing)
      ),
    };
  }
  throw new Error("Only Polygon/MultiPolygon supported");
};

export const fcToBounds = (fc: any): [[number, number], [number, number]] | null => {
  if (!fc?.features?.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of fc.features) {
    const each = (coords: any) => {
      if (typeof coords?.[0] === "number") {
        const [x, y] = coords;
        if (Number.isFinite(x) && Number.isFinite(y)) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      } else if (Array.isArray(coords)) coords.forEach(each);
    };
    const g = f.geometry;
    if (!g) continue;
    if (g.type === "Polygon" || g.type === "MultiPolygon") each(g.coordinates);
  }
  if (minX === Infinity) return null;
  return [[minX, minY], [maxX, maxY]];
};

export const getOuterRing = (geom: any): number[][] => {
  if (!geom) return [];
  if (geom.type === "Polygon") return geom.coordinates?.[0] ?? [];
  if (geom.type === "MultiPolygon") {
    let best: number[][] = [];
    let bestLen = 0;
    (geom.coordinates || []).forEach((poly: number[][][]) => {
      const ring = poly?.[0] || [];
      if (ring.length > bestLen) { best = ring; bestLen = ring.length; }
    });
    return best;
  }
  return [];
};
