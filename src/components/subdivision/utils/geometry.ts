import type { Position, Polygon, MultiPolygon } from 'geojson';

/**
 * Converts a Polygon geometry to a MultiPolygon geometry
 */
export function ensureMultiPolygon(geometry: Polygon | MultiPolygon): MultiPolygon {
  if (geometry.type === 'MultiPolygon') {
    return geometry;
  }
  return {
    type: 'MultiPolygon',
    coordinates: [geometry.coordinates]
  };
}

/**
 * Calculates the area of a polygon in square meters
 */
export function calculateArea(coordinates: Position[][]): number {
  // Basic implementation of the Shoelace formula (Gauss's area formula)
  let area = 0;
  const ring = coordinates[0]; // Use outer ring only

  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }

  return Math.abs(area) / 2;
}

/**
 * Checks if a point is inside a polygon
 */
export function isPointInPolygon(point: Position, polygon: Position[][]): boolean {
  const [x, y] = point;
  const ring = polygon[0]; // Use outer ring only
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Checks if two polygons overlap
 */
export function doPolygonsOverlap(poly1: Position[][], poly2: Position[][]): boolean {
  // Check if any point from poly1 is inside poly2
  for (const point of poly1[0]) {
    if (isPointInPolygon(point, poly2)) return true;
  }

  // Check if any point from poly2 is inside poly1
  for (const point of poly2[0]) {
    if (isPointInPolygon(point, poly1)) return true;
  }

  return false;
}

/**
 * Validates that a subdivision is entirely contained within its parent parcel
 */
export function validateSubdivisionContainment(
  subdivision: Position[][],
  parentParcel: Position[][]
): boolean {
  // Check if all points of the subdivision are inside the parent parcel
  return subdivision[0].every(point => isPointInPolygon(point, parentParcel));
}