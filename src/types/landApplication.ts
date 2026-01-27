// Land Application types based on backend API documentation
// These feed into the CCRO workflow

// Ownership types map to official forms
export type OwnershipType =
  | 'individual'
  | 'joint_spouse'
  | 'group_resident'
  | 'group_non_resident'
  | 'institution';

export const OWNERSHIP_LABELS: Record<OwnershipType, { en: string; sw: string; form: string }> = {
  individual: { en: 'Individual', sw: 'Mtu Binafsi', form: 'Fomu 18' },
  joint_spouse: { en: 'Joint Spouse', sw: 'Wanandoa', form: 'Fomu 18' },
  group_resident: { en: 'Group (Resident)', sw: 'Kikundi cha Wakazi', form: 'Fomu 18B' },
  group_non_resident: { en: 'Group (Non-Resident)', sw: 'Kikundi Wasio Wakazi', form: 'Fomu 18C' },
  institution: { en: 'Institution', sw: 'Taasisi', form: 'Fomu 18D' },
};

// Land application workflow stages
export type LandApplicationStatus =
  | 'draft'
  | 'pending_verification'
  | 'verified'
  | 'pending_council'
  | 'council_approved'
  | 'pending_assembly'
  | 'approved'
  | 'assigned'
  | 'surveying'
  | 'survey_complete'
  | 'under_review'
  | 'completed'
  | 'rejected';

export const LAND_APPLICATION_STATUS_LABELS: Record<LandApplicationStatus, { en: string; sw: string }> = {
  draft: { en: 'Draft', sw: 'Rasimu' },
  pending_verification: { en: 'Pending Verification', sw: 'Inasubiri Uthibitisho' },
  verified: { en: 'Verified', sw: 'Imethibitishwa' },
  pending_council: { en: 'Pending Council', sw: 'Inasubiri Baraza' },
  council_approved: { en: 'Council Approved', sw: 'Baraza Limekubali' },
  pending_assembly: { en: 'Pending Assembly', sw: 'Inasubiri Mkutano' },
  approved: { en: 'Approved', sw: 'Imekubaliwa' },
  assigned: { en: 'Assigned', sw: 'Imepewa Mpimaji' },
  surveying: { en: 'Surveying', sw: 'Inapimwa' },
  survey_complete: { en: 'Survey Complete', sw: 'Upimaji Umekamilika' },
  under_review: { en: 'Under Review', sw: 'Inakaguliwa' },
  completed: { en: 'Completed', sw: 'Imekamilika' },
  rejected: { en: 'Rejected', sw: 'Imekataliwa' },
};

// Applicant role in land application
export type ApplicantRole = 'applicant' | 'spouse' | 'representative';

// Neighbor direction
export type NeighborDirection = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';

// Neighbor type
export type NeighborType = 'person' | 'road' | 'river' | 'school' | 'church' | 'mosque' | 'government' | 'other';

// Application applicant
export interface ApplicationApplicant {
  id: number;
  applicant_order: number;
  role: ApplicantRole;
  party: number;
  party_name?: string;
  party_nida?: string;
  birth_locality: number;
  birth_locality_name?: string;
}

// Application member (family/group)
export interface ApplicationMember {
  id: number;
  member_type: 'family' | 'group';
  full_name: string;
  relationship?: string;
}

// Application neighbor
export interface ApplicationNeighbor {
  id: number;
  name: string;
  direction: NeighborDirection;
  neighbor_type: NeighborType;
  field_verified?: boolean;
  field_notes?: string;
}

// Parcel linked to application
export interface ApplicationParcel {
  id: number;
  parcel_number: string;
  uka_namba?: string;
  area_sqm: number;
  has_conflicts: boolean;
}

// Main Land Application model
export interface LandApplication {
  id: number;
  claim_number: string;
  registration_number?: string;
  
  // Ownership
  ownership_type: OwnershipType;
  ownership_type_display?: string;
  
  // Entity fields (for groups/institutions)
  entity_name?: string;
  entity_registration_number?: string;
  entity_address?: string;
  
  // Location
  locality: number;
  locality_name?: string;
  hamlet?: string;
  
  // Land details
  estimated_area_acres?: number;
  current_land_use?: string;
  proposed_land_use?: string;
  tenure_type?: 'unlimited' | 'limited';
  
  // Marital info (for individual/joint)
  marital_status?: string;
  marriage_type?: 'monogamous' | 'polygamous';
  is_family_ownership?: boolean;
  
  // Terms acceptance
  terms_location_size_accepted?: boolean;
  terms_rent_accepted?: boolean;
  terms_land_use_accepted?: boolean;
  terms_boundary_accepted?: boolean;
  terms_other_accepted?: boolean;
  terms_payment_accepted?: boolean;
  
  // Workflow status
  status: LandApplicationStatus;
  status_display?: string;
  
  // Related data
  applicants?: ApplicationApplicant[];
  members?: ApplicationMember[];
  neighbors?: ApplicationNeighbor[];
  parcels?: ApplicationParcel[];
  
  // Counts for list view
  applicant_count?: number;
  primary_applicant_name?: string;
  
  // Assignment
  assigned_surveyor?: number;
  assigned_surveyor_name?: string;
  assigned_at?: string;
  
  // Timestamps
  submitted_at?: string;
  verified_at?: string;
  verified_by?: number;
  reviewed_at?: string;
  reviewed_by?: number;
  completed_at?: string;
  rejected_at?: string;
  rejected_by?: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  
  // Subdivision context (optional)
  zone_snapshot?: number;
  parent_parcel?: number;
}

// Create/Update payload types
export interface CreateLandApplicationPayload {
  ownership_type: OwnershipType;
  locality: number;
  hamlet?: string;
  estimated_area_acres?: number;
  current_land_use?: string;
  proposed_land_use?: string;
  tenure_type?: 'unlimited' | 'limited';
  marital_status?: string;
  marriage_type?: 'monogamous' | 'polygamous';
  is_family_ownership?: boolean;
  terms_location_size_accepted?: boolean;
  terms_rent_accepted?: boolean;
  terms_land_use_accepted?: boolean;
  terms_boundary_accepted?: boolean;
  terms_other_accepted?: boolean;
  terms_payment_accepted?: boolean;
  entity_name?: string;
  entity_registration_number?: string;
  entity_address?: string;
  applicants?: {
    applicant_order: number;
    role: ApplicantRole;
    party: number;
    birth_locality: number;
  }[];
  members?: {
    member_type: 'family' | 'group';
    full_name: string;
    relationship?: string;
  }[];
  neighbors?: {
    name: string;
    direction: NeighborDirection;
    neighbor_type: NeighborType;
  }[];
  zone_snapshot?: number;
  parent_parcel?: number;
}

// Council/Assembly approval payload
export interface ApprovalPayload {
  decision: 'approved' | 'rejected';
  chairman_name: string;
  veo_name: string;
  meeting_date: string;
  notes?: string;
}

// Surveyor assignment payload
export interface AssignSurveyorPayload {
  surveyor_id: number;
}

// Rejection payload
export interface RejectApplicationPayload {
  reason: string;
}

// Neighbor verification payload
export interface VerifyNeighborPayload {
  field_verified: boolean;
  field_notes?: string;
}

// Query filter params
export interface LandApplicationFilters {
  status?: LandApplicationStatus;
  ownership_type?: OwnershipType;
  locality?: number;
  surveyor?: number;
  ready_for_survey?: boolean;
  my_assignments?: boolean;
  search?: string;
}
