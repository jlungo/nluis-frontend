import api from "@/lib/axios";
import type {
  ProjectI,
  ProjectTypeI,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStats,
  ProjectFilters,
  ProjectUser,
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  PatchedDocument,
  Parcel,
  ParcelParty,
  ParcelInfo,
  Signatory,
  CreateSignatoryRequest,
  TeamMember,
  CreateTeamMemberRequest,
  AddTeamMemberRequest,
  MonitoringRecord,
  Locality,
  TaskMenuItem,
  ProjectApprovalResponse,
  ParcelSearchResponse,
  TeamMemberHistory,
} from "@/types/projects";

class ProjectService {
  private baseUrl = "/projects";

  // Project Types
  async getProjectTypes(): Promise<ProjectTypeI[]> {
    const response = await api.get(`${this.baseUrl}/types`);
    return response.data;
  }

  // Projects CRUD
  async getProjects(filters: ProjectFilters = {}): Promise<ProjectI[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data.results || response.data;
  }

  async getProject(id: string): Promise<ProjectI> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getOrganizationProjects(
    organizationId: string,
    filters: ProjectFilters = {}
  ): Promise<ProjectI[]> {
    const params = new URLSearchParams();
    params.append("organization_id", organizationId);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data.results || response.data;
  }

  async createProject(data: CreateProjectRequest): Promise<ProjectI> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updateProject(
    id: string,
    data: UpdateProjectRequest
  ): Promise<ProjectI> {
    const response = await api.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Project Users
  async getProjectUsers(projectId: string): Promise<ProjectUser[]> {
    const response = await api.get(`${this.baseUrl}/${projectId}/users`);
    return response.data;
  }

  async assignUserToProject(
    projectId: string,
    userId: string,
    role: ProjectUser["role"]
  ): Promise<ProjectUser> {
    const response = await api.post(`${this.baseUrl}/${projectId}/users`, {
      user_id: userId,
      role,
    });
    return response.data;
  }

  async removeUserFromProject(
    projectId: string,
    userId: string
  ): Promise<void> {
    await api.delete(`${this.baseUrl}/${projectId}/users/${userId}`);
  }

  // Statistics
  async getProjectStats(organizationId?: string): Promise<ProjectStats> {
    const url = organizationId
      ? `${this.baseUrl}/stats?organization_id=${organizationId}`
      : `${this.baseUrl}/stats`;
    const response = await api.get(url);
    return response.data;
  }

  // Project Approval
  async approveProject(id: string): Promise<ProjectApprovalResponse> {
    const response = await api.post(`${this.baseUrl}/approve/${id}`);
    return response.data;
  }

  // Documents
  async getDocuments(projectId: string, taskId?: string): Promise<Document[]> {
    const url = taskId
      ? `${this.baseUrl}/document-list/${projectId}/${taskId}`
      : `${this.baseUrl}/documents/${projectId}`;
    const response = await api.get(url);
    return response.data;
  }

  async getDocument(id: string): Promise<Document> {
    const response = await api.get(`${this.baseUrl}/documents/${id}`);
    return response.data;
  }

  async createDocument(data: CreateDocumentRequest): Promise<Document> {
    const response = await api.post(`${this.baseUrl}/documents/create`, data);
    return response.data;
  }

  async updateDocument(
    id: string,
    data: UpdateDocumentRequest
  ): Promise<Document> {
    const response = await api.put(`${this.baseUrl}/documents/${id}`, data);
    return response.data;
  }

  async patchDocument(id: string, data: PatchedDocument): Promise<Document> {
    const response = await api.patch(`${this.baseUrl}/documents/${id}`, data);
    return response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/documents/${id}`);
  }

  // Parcels
  async getParcels(projectId: string, stage: string): Promise<Parcel[]> {
    const response = await api.get(
      `${this.baseUrl}/parcels/${projectId}/${stage}`
    );
    return response.data;
  }

  async getParcelInfo(id: string): Promise<ParcelInfo> {
    const response = await api.get(`${this.baseUrl}/parcels/info/${id}`);
    return response.data;
  }

  async getParcelParties(id: string): Promise<ParcelParty[]> {
    const response = await api.get(`${this.baseUrl}/parcels/parties/${id}`);
    return response.data;
  }

  async searchParcels(
    projectId: string,
    search: string
  ): Promise<ParcelSearchResponse> {
    const response = await api.get(
      `${this.baseUrl}/parcels/search/${projectId}/${search}`
    );
    return response.data;
  }

  async refreshParcelParties(
    projectId: string,
    claimNo: string
  ): Promise<void> {
    await api.get(
      `${this.baseUrl}/parcels-party-refresh/${projectId}/${claimNo}`
    );
  }

  // Team Members
  async getTeamMembers(projectId: string): Promise<TeamMember[]> {
    const response = await api.get(`${this.baseUrl}/team-members/${projectId}`);
    return response.data;
  }

  async addTeamMember(data: AddTeamMemberRequest): Promise<TeamMember> {
    const response = await api.post(`${this.baseUrl}/team-members/add`, data);
    return response.data;
  }

  async createTeamMember(data: CreateTeamMemberRequest): Promise<TeamMember> {
    const response = await api.post(
      `${this.baseUrl}/team-members/create`,
      data
    );
    return response.data;
  }

  async getTeamMemberHistory(projectId: string): Promise<TeamMemberHistory[]> {
    const response = await api.get(
      `${this.baseUrl}/team-members-history/${projectId}`
    );
    return response.data;
  }

  // Signatories
  async getSignatories(projectId: string): Promise<Signatory[]> {
    const response = await api.get(`${this.baseUrl}/signatories/${projectId}`);
    return response.data;
  }

  async createSignatory(data: CreateSignatoryRequest): Promise<Signatory> {
    const response = await api.post(`${this.baseUrl}/signatories/create`, data);
    return response.data;
  }

  // Localities
  async getLocalities(projectId: string): Promise<Locality[]> {
    const response = await api.get(`${this.baseUrl}/localities/${projectId}`);
    return response.data;
  }

  // Monitoring
  async getMonitoringRecords(): Promise<MonitoringRecord[]> {
    const response = await api.get(`${this.baseUrl}/monitoring`);
    return response.data;
  }

  // Task Menu
  async getTaskMenu(
    projectTypeId: string,
    projectId: string
  ): Promise<TaskMenuItem[]> {
    const response = await api.get(
      `${this.baseUrl}/task-menu/${projectTypeId}/${projectId}`
    );
    return response.data;
  }

  // Public endpoints
  async getPublicProjectTypes(): Promise<ProjectTypeI[]> {
    const response = await api.get(`${this.baseUrl}/public/project-types`);
    return response.data;
  }

  async getPublishedProjects(): Promise<ProjectI[]> {
    const response = await api.get(`${this.baseUrl}/published`);
    return response.data;
  }

  async getProjectStatuses(): Promise<string[]> {
    const response = await api.get(`${this.baseUrl}/project-status`);
    return response.data;
  }

  // Filtered project lists
  async getFilteredProjects(
    projectTypeId: string,
    statusId: string,
    desc: string
  ): Promise<ProjectI[]> {
    const response = await api.get(
      `${this.baseUrl}/list/${projectTypeId}/${statusId}/${desc}`
    );
    return response.data;
  }
}

export const projectService = new ProjectService();
