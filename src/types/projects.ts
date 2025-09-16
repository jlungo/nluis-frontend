export interface ProjectI {
  id: string;
  organization: string;
  // organization_name: string;
  name: string;
  reference_number: string;
  registration_date: string;
  // type: string | null;
  authorization_date: string;
  budget: string;
  project_status: number;
  description?: string | null;
  approval_status: number;
  remarks: string | null;
  created_at: string;
  total_locality: string | null;
  total_funders: string | null;
  funders: Array<{ id: string; name: string; category: string }> | null;
  localities: Array<{
    approval_status: number;
    id: string;
    locality__id: string;
    locality__name: string;
    locality__level: string;
    progress: number;
    remarks: string | null;
  }> | null;
} // Fix returning organization_name, localities

export interface ProjectsListPageProps {
  module: string;
  moduleLevel: string;
  pageTitle: string;
}

export interface ProjectTypeI {
  id: string;
  name: string;
  level_id: string;
}

export interface ProjectFunderI {
  id: number;
  name: string;
  category: string;
}

export type SelectedLocality = {
  id: string;
  name: string;
  path: string;
};

export interface LocalityLevelI {
  id: string;
  name: string;
  description: string;
  code: string;
  parent: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalityI {
  id: string;
  name: string;
  code?: string;
  level?: string;
  parent?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectStatsI {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  draft_projects: number;
  projects_by_module_level: Array<{
    module_level: string;
    count: number;
  }>;
  projects_by_status: Array<{
    status: string;
    count: number;
  }>;
}

export interface ProjectQueryParamsI {
  project_id?: string;
  organization?: string;
  module_level?: string | number;
  status?: string;
  approval_status?: string;
  search?: string;
  registration_date?: string;
  authorization_date?: string;
  funder?: string;
  offset?: number;
  limit?: number;
}

export interface CreateProjectDataI {
  name: string;
  reference_number: string;
  organization: string;
  description: string;
  registration_date: string;
  authorization_date: string;
  budget: string;
  module_level: string;
  funder_ids: string[];
  locality_ids: string[];
}

export interface UpdateProjectDataI {
  name: string;
  organization: string;
  description: string;
  registration_date: string;
  authorization_date: string;
  budget: string;
  module_level: string;
  funder_ids: string[];
  locality_ids: string[];
}

export interface ProjectUser {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: "manager" | "coordinator" | "member" | "observer";
  assigned_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  type_id: string;
  organization_id: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  location?: {
    region?: string;
    district?: string;
    ward?: string;
    village?: string;
  };
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: string;
  progress_percentage?: number;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  draft_projects: number;
  projects_by_type: Array<{
    type_name: string;
    count: number;
  }>;
  projects_by_status: Array<{
    status: string;
    count: number;
  }>;
}

export interface ProjectFilters {
  search?: string;
  status?: string;
  type?: string;
  organization_id?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

// Document Types
export interface Document {
  id: string;
  project_id: string;
  task_id?: string;
  file_name: string;
  file_size: number;
  document_type: string;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
  version?: number;
  is_public?: boolean;
}

export interface CreateDocumentRequest {
  project_id: number;
  task_id?: number;
  file: string; // base64 encoded file
  document_type: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateDocumentRequest {
  description?: string;
  document_type?: string;
  is_public?: boolean;
}

export interface PatchedDocument extends Partial<UpdateDocumentRequest> {}

// Parcel Types
export interface Parcel {
  id: string;
  project_id: string;
  stage: string;
  parcel_number: string;
  claim_number?: string;
  area_hectares?: number;
  coordinates?: string;
  land_use_type?: string;
  owner_name?: string;
  owner_id_number?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ParcelParty {
  id: string;
  parcel_id: string;
  party_type: "owner" | "tenant" | "claimant" | "witness";
  name: string;
  id_number?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  share_percentage?: number;
  created_at?: string;
}

export interface ParcelInfo {
  parcel: Parcel;
  parties: ParcelParty[];
  documents?: Document[];
}

// Signatory Types
export interface Signatory {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: string;
  signing_order?: number;
  signed_at?: string;
  status: "pending" | "signed" | "rejected";
  created_at?: string;
}

export interface CreateSignatoryRequest {
  project_id: number;
  user_id: number;
  role: string;
  signing_order?: number;
}

// Team Member Types
export interface TeamMember {
  id: string;
  project_id: string;
  user_id?: string;
  name?: string;
  email?: string;
  role: string;
  assigned_at: string;
  status: "active" | "inactive";
}

export interface CreateTeamMemberRequest {
  project_id: number;
  user_id?: number;
  name?: string;
  email?: string;
  role: string;
}

export interface AddTeamMemberRequest {
  project_id: number;
  user_id: number;
  role: string;
}

// Monitoring Types
export interface MonitoringRecord {
  id: string;
  project_id: string;
  monitoring_date: string;
  monitor_name: string;
  findings: string;
  recommendations: string;
  status: "satisfactory" | "needs_improvement" | "unsatisfactory";
  created_at?: string;
}

// Locality Types
export interface Locality {
  id: string;
  project_id: string;
  region: string;
  district?: string;
  ward?: string;
  village?: string;
  population?: number;
  area_hectares?: number;
  created_at?: string;
}

// Task Menu Types
export interface TaskMenuItem {
  id: string;
  project_type_id: string;
  task_name: string;
  task_description?: string;
  order: number;
  required: boolean;
  depends_on?: string;
  created_at?: string;
}

// API Response Types
export interface ApiListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProjectApprovalResponse {
  success: boolean;
  message: string;
  project: ProjectI;
}

export interface DocumentListResponse {
  documents: Document[];
  total_count: number;
}

export interface ParcelSearchResponse {
  parcels: Parcel[];
  total_count: number;
}

export interface TeamMemberHistory {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  action: "added" | "removed" | "role_changed";
  previous_role?: string;
  new_role?: string;
  performed_by: string;
  performed_at: string;
}
