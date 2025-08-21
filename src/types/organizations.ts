export interface Organization {
  id: string;
  number?: number; // 1. Added sequential number for easier manipulation
  name: string;
  type: OrganizationType;
  description?: string;
  physical_address: string;
  district: string;
  region: string;
  primary_email: string;
  focal_person_name: string;
  focal_person_job_title: string;
  focal_person_email: string;
  focus_areas: string[];
  members_count: number;
  projects_count: number;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
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
