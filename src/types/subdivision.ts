import type { Feature, MultiPolygon } from 'geojson';

// Basic parcel properties
export interface ParcelProperties {
  id: string;
  title: string;
  size: number;
  status: 'Active' | 'Inactive';
  landUseId: string | number;
}

export type ParcelFeature = Feature<MultiPolygon, ParcelProperties>;

// Party information for ownership/rights
export interface PartyInfo {
  id: string;
  name: string;
  role: 'Owner' | 'Co-Owner' | 'Tenant' | 'Administrator';
  contact?: string;
  idNumber?: string;
}

// Allocation of rights/ownership for subdivisions
export interface PartyAllocation {
  partyId: string;
  name: string;
  share: number;  // percentage of ownership/rights
}

// Base subdivision properties without ID
export interface BaseSubdivisionProperties {
  title: string;
  size: number;
  status: 'Pending' | 'Active' | 'Inactive';
  landUseId: string | number;
  parentId: string;
  allocations: PartyAllocation[];
  subdivisionDate: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvalDate?: string;
  approvedBy?: string;
  notes?: string;
}

// Complete subdivision properties with ID
export interface SubdivisionProperties extends BaseSubdivisionProperties {
  id: string;
}

// GeoJSON feature types for subdivisions
export type SubdivisionFeature = Feature<MultiPolygon, SubdivisionProperties>;
export type NewSubdivisionFeature = Feature<MultiPolygon, BaseSubdivisionProperties>;

// Validation error types
export interface ValidationError {
  type: 'Overlap' | 'OutOfBounds' | 'InvalidGeometry' | 'InvalidAllocation';
  message: string;
  features?: string[];  // IDs of involved features
}

// API interface for subdivision operations
export interface SubdivisionAPI {
  createSubdivision: (parentId: string, subdivision: SubdivisionFeature) => Promise<void>;
  updateSubdivision: (id: string, updates: Partial<SubdivisionFeature>) => Promise<void>;
  deleteSubdivision: (id: string) => Promise<void>;
  validateSubdivision: (subdivision: SubdivisionFeature) => Promise<ValidationError[]>;
  getSubdivisions: (parentId: string) => Promise<SubdivisionFeature[]>;
}