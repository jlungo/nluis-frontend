export interface OrganizationI {
  id: string;
  name: string;
  type: OrganizationType;
  type_name?: string; // For easier access to type name
  url: string;
  level?: OrganizationLevelE;
  status?: OrganizationStatusE
  description?: string;
  short_name?: string;
  email?: string;
  address: string;
  primary_email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: FocalPErsonGenderE;
  focal_person_email?: string;
  members_count?: number;
  projects_count?: number;
  created_at?: string;
  updated_at?: string;
}

export enum OrganizationStatusE {
  ACTIVE = 3,
  INACTIVE = 2,
  PENDING = 1,
}

export enum OrganizationLevelE {
  PARENT = 1,
  CHILD = 2,
}
export enum FocalPErsonGenderE {
  PARENT = 1,
  CHILD = 2,
}
export interface OrganizationType {
  id: string;
  name: string;
  description?: string;
}

// Patched versions for partial updates
export interface PatchedOrganization {
  name?: string;
  type?: string;
  description?: string;
  physical_address?: string;
  district?: string;
  region?: string;
  primary_email?: string;
  focal_person_name?: string;
  focal_person_job_title?: string;
  focal_person_email?: string;
  focus_areas?: string[];
  status?: 'active' | 'inactive' | 'pending';
}

export interface PatchedOrganizationType {
  name?: string;
  description?: string;
}

export interface OrganizationStats {
  total_organizations: number;
  total_members: number;
  organizations_by_type: {
    type_id: string;
    type_name: string;
    count: number;
  }[];
  coverage_areas: {
    area: string;
    organization_count: number;
  }[];
}

export interface OrganizationFilters {
  type?: string;
  area?: string;
  search?: string;
  status?: string;
  limit?: number;
  sort?: string;
}
