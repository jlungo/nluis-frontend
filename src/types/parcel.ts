import type { Feature, MultiPolygon } from 'geojson';

export interface ParcelProperties {
  id: string;
  title: string;
  size: number;
  status: 'Active' | 'Inactive';
  landUseId: string | number;
  allocations: Array<any>; // TODO: Define allocation type
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

export type ParcelFeature = Feature<MultiPolygon, ParcelProperties>;