// Backend CCRO Application stages (NOT subdivision stages)
export type CCROStage =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'issued';

export type NidaCheckStatus = 'pending' | 'verified' | 'missing' | 'invalid';

export const STAGE_LABELS: Record<CCROStage, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  issued: 'Issued',
};

export const NIDA_STATUS_LABELS: Record<NidaCheckStatus, string> = {
  pending: 'Pending Verification',
  verified: 'All NIDA Verified ✅',
  missing: 'NIDA Missing ❌',
  invalid: 'NIDA Invalid ❌',
};

// Individual party from backend
export interface IndividualParty {
  party: number; // Party ID (primary key)
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string; // Read-only, computed
  gender: 'M' | 'F' | 'O';
  date_of_birth?: string; // ISO date
  nida_number?: string; // 20 digits for Tanzania
  nida_verified: boolean; // Critical for CCRO
  nida_verified_at?: string; // ISO datetime
  nida_verified_by_name?: string; // Read-only
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  marital_status?: string;
  photo_url?: string; // Auto-generated from ImageField
}

// Party wrapper (can be individual or group)
export interface Party {
  id: number;
  party_type: 'individual' | 'organization';
  name: string; // Computed for list view
  contact?: string; // Computed for list view
  individual_party?: IndividualParty; // Only when party_type='individual'
  created_at: string;
  allocations_count?: number; // For detail view
}

// Allocation (links party to parcel with ownership share)
export interface Allocation {
  id: number;
  parcel: number;
  party: number;
  party_name: string; // From PartyDetailSerializer
  proposed_share: number; // Percentage 0-100, must sum to 100%
  proposed_right_type?: 'customary' | 'lease' | 'joint' | 'group';
  status: 'proposed' | 'confirmed' | 'rejected'; // 'confirmed' after CCRO approval
  created_at: string;
  updated_at: string;
}

// Tenure right (created after CCRO is issued)
export interface TenureRight {
  id: number;
  parcel: number;
  party: number;
  party_name: string;
  right_type: 'customary' | 'lease' | 'joint' | 'group';
  share: number;
  status: 'active' | 'suspended' | 'terminated';
  start_date: string; // ISO date
  end_date?: string; // ISO date
  has_certificate: boolean; // Read-only
}

// CCRO Certificate (issued for tenure right)
export interface CCROCertificate {
  right: number; // TenureRight ID
  issue_date: string; // ISO date
  expiry_date?: string; // ISO date
  document_url?: string; // PDF certificate URL
  created_at: string;
}

// Parcel details for CCRO view
export interface CCROParcelDetail {
  id: number;
  parcel_number: string; // Auto-generated
  area_sqm: number; // Auto-calculated
  stage: 'draft' | 'gis_approval' | 'registered' | 'printed';
  geom?: any; // GeoJSON geometry
  allocations: Allocation[]; // All allocations for this parcel
  locality: number;
  locality_name: string;
  land_use_zone: number;
  zone_name: string;
  current_use?: string;
  proposed_use?: string;
  created_at: string;
}

// CCRO Application - office review workflow
export interface CCROApplication {
  id: number;
  parcel: number;
  party: number; // Main party (can have co-owners via allocations)
  party_details?: Party; // Full party details in detail view
  parcel_details?: CCROParcelDetail; // Full parcel details with allocations
  
  // CCRO Workflow Stage (NOT subdivision stage)
  stage: CCROStage; // submitted → review → approved → issued
  
  // NIDA Validation Gate
  nida_check_status: NidaCheckStatus;
  nida_check_notes?: string;
  nida_checked_at?: string; // ISO datetime
  nida_checked_by_name?: string; // Read-only
  
  // Assignment
  assigned_to?: number; // CCRO Officer
  
  // Timestamps
  submitted_at?: string; // ISO datetime
  created_at: string;
  updated_at: string;
  
  // Computed fields (from serializer methods)
  can_issue?: boolean; // Can this CCRO be issued?
  can_issue_details?: {
    can_issue: boolean;
    reason: string;
  };
  nida_status_check?: {
    can_issue: boolean;
    missing_parties: string[];
    notes: string;
  };
}