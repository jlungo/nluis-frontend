import type { Position, Polygon, MultiPolygon } from 'geojson';
import { area as turfArea, booleanPointInPolygon, booleanWithin, booleanIntersects, bbox as turfBbox } from '@turf/turf';
import { polygon as turfPolygon, point as turfPoint } from '@turf/helpers';

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
 * Calculates the area of a polygon in square meters using turf
 */
export function calculateArea(coordinates: Position[][]): number {
  try {
    const poly = turfPolygon(coordinates as any);
    return turfArea(poly);
  } catch (err) {
    // Fallback: return 0 on error
    return 0;
  }
}

/**
 * Checks if a point is inside a polygon using turf
 */
export function isPointInPolygon(point: Position, polygon: Position[][]): boolean {
  try {
    const pt = turfPoint(point as any);
    const poly = turfPolygon(polygon as any);
    return booleanPointInPolygon(pt, poly as any);
  } catch {
    return false;
  }
}

/**
 * Checks if two polygons overlap (intersect) using bbox pre-check + turf booleanIntersects
 */
export function doPolygonsOverlap(poly1: Position[][], poly2: Position[][]): boolean {
  try {
    const p1 = turfPolygon(poly1 as any);
    const p2 = turfPolygon(poly2 as any);

    // quick bbox test to avoid expensive geometry operations when far apart
    const b1 = turfBbox(p1);
    const b2 = turfBbox(p2);
    // bboxes are [minX, minY, maxX, maxY]
    if (b1[2] < b2[0] || b1[0] > b2[2] || b1[3] < b2[1] || b1[1] > b2[3]) {
      return false;
    }

    return booleanIntersects(p1 as any, p2 as any);
  } catch {
    return false;
  }
}

/**
 * Validates that a subdivision is entirely contained within its parent parcel
 */
export function validateSubdivisionContainment(
  subdivision: Position[][],
  parentParcel: Position[][]
): boolean {
  try {
    const sub = turfPolygon(subdivision as any);
    const parent = turfPolygon(parentParcel as any);
    return booleanWithin(sub as any, parent as any);
  } catch {
    return false;
  }
}