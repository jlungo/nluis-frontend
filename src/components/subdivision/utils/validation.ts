import type { Position } from 'geojson';
import type { 
  ParcelFeature, 
  SubdivisionFeature, 
  ValidationError 
} from '@/types/subdivision';
import { 
  calculateArea, 
  validateSubdivisionContainment, 
  doPolygonsOverlap 
} from './geometry';

export function validateSubdivision(
  subdivision: SubdivisionFeature,
  parentParcel: ParcelFeature,
  otherSubdivisions: SubdivisionFeature[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if subdivision is within parent parcel
  const isContained = validateSubdivisionContainment(
    subdivision.geometry.coordinates[0] as Position[][],
    parentParcel.geometry.coordinates[0] as Position[][]
  );

  if (!isContained) {
    errors.push({
      type: 'OutOfBounds',
      message: 'Subdivision must be completely within the parent parcel boundaries'
    });
  }

  // Check for overlaps with other subdivisions
  for (const other of otherSubdivisions) {
    if (other.properties.id === subdivision.properties.id) continue;

    const overlaps = doPolygonsOverlap(
      subdivision.geometry.coordinates[0] as Position[][],
      other.geometry.coordinates[0] as Position[][]
    );

    if (overlaps) {
      errors.push({
        type: 'Overlap',
        message: `Subdivision overlaps with ${other.properties.title}`,
        features: [other.properties.id]
      });
    }
  }

  // Check party allocations
  const totalAllocation = subdivision.properties.allocations.reduce(
    (sum, allocation) => sum + allocation.share,
    0
  );

  if (totalAllocation !== 100) {
    errors.push({
      type: 'InvalidAllocation',
      message: 'Total party allocation must equal 100%'
    });
  }

  return errors;
}

export function validateAllSubdivisions(
  subdivisions: SubdivisionFeature[],
  parentParcel: ParcelFeature
): ValidationError[] {
  const errors: ValidationError[] = [];
  const totalArea = calculateArea(parentParcel.geometry.coordinates[0] as Position[][]);
  let subdivisionArea = 0;

  // Validate each subdivision
  subdivisions.forEach(subdivision => {
    // Add individual subdivision validation errors
    errors.push(...validateSubdivision(
      subdivision,
      parentParcel,
      subdivisions.filter(s => s.properties.id !== subdivision.properties.id)
    ));

    // Sum up areas
    subdivisionArea += calculateArea(subdivision.geometry.coordinates[0] as Position[][]);
  });

  // Check if total area matches parent parcel (with small tolerance for rounding)
  const tolerance = totalArea * 0.001; // 0.1% tolerance
  if (Math.abs(totalArea - subdivisionArea) > tolerance) {
    errors.push({
      type: 'InvalidGeometry',
      message: 'Total area of subdivisions must equal parent parcel area'
    });
  }

  return errors;
}