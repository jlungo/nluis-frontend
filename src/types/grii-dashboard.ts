/**
 * GRII Dashboard Types
 * Geographic Rights & Information Index System-wide Dashboard
 */

// ==================== SUBDIVISION & SPATIAL ====================

export interface SubdivisionStats {
  total: number;
  submitted: number;
  underReview: number;
  approved: number;
  completed: number;
  rejected: number;
  avgProcessingDays: number;
}

export interface ParcelStats {
  total: number;
  byStage: {
    draft: number;
    gisApproval: number;
    registered: number;
    printed: number;
  };
  byLocality: { [localityName: string]: number };
  byZone: { [zoneName: string]: number };
  totalAreaSqm: number;
  avgAreaSqm: number;
  withConflicts: number;
}

export interface PhotoStats {
  total: number;
  byType: {
    site: number;
    boundary: number;
    landmark: number;
    other: number;
  };
  avgPerParcel: number;
  missingPhotos: number;
}

export interface SurveyorPerformance {
  surveyorId: number;
  surveyorName: string;
  parcelCount: number;
  applicationsSubmitted: number;
  avgProcessingDays: number;
  qualityScore?: number;
}

// ==================== CCRO & TENURE ====================

export interface CCROStats {
  total: number;
  byStage: {
    submitted: number;
    underReview: number;
    approved: number;
    issued: number;
    rejected: number;
  };
  avgDaysSubmittedToIssued: number;
}

export interface NidaStats {
  verified: number;
  pending: number;
  missing: number;
  invalid: number;
  verificationRate: number; // percentage
  blockedApplications: number;
}

export interface PartyStats {
  individualParties: number;
  organizationParties: number;
  withPhotos: number;
  withValidContact: number;
  genderBreakdown: {
    male: number;
    female: number;
    other: number;
  };
}

export interface AllocationStats {
  singleOwnerParcels: number;
  multiOwnerParcels: number;
  avgOwnersPerParcel: number;
  allocationConflicts: number; // don't sum to 100%
  byRightType: {
    customary: number;
    lease: number;
    joint: number;
    group: number;
  };
}

export interface TenureRightStats {
  totalIssued: number;
  byRightType: {
    customary: number;
    lease: number;
    joint: number;
    group: number;
  };
  byStatus: {
    active: number;
    suspended: number;
    terminated: number;
  };
  expiringCertificates: number;
  expiredCertificates: number;
}

export interface CertificateStats {
  issued: number;
  pending: number;
  revoked: number;
  avgDaysApprovalToCertificate: number;
  withDocuments: number;
}

export interface CCROOfficerPerformance {
  officerId: number;
  officerName: string;
  applicationsAssigned: number;
  approvalRate: number; // percentage
  avgProcessingDays: number;
  errorRate: number; // percentage
}

// ==================== ZONING & LAND USE ====================

export interface ZoningStats {
  totalPlans: number;
  byStatus: {
    draft: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
  zoneCoverageAreaSqm: number;
  existingVsProposed: {
    existing: number;
    proposed: number;
  };
  latestVersionPerLocality: number;
}

export interface ZoneStats {
  totalZones: number;
  byType: {
    point: number;
    line: number;
    polygon: number;
  };
  totalAreaSqm: number;
  byLocality: { [localityName: string]: number };
  docCount: number;
}

// ==================== PROJECTS & PROGRAMS ====================

export interface ProjectStats {
  total: number;
  byType: { [typeName: string]: number };
  byStatus: {
    pending: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  totalBudget: number;
  byOrganization: { [orgName: string]: number };
  localityCoverage: number;
}

export interface ProjectTimeline {
  registered: number; // this period
  authorized: number;
  published: number;
  completed: number;
  avgDurationDays: number;
}

export interface TeamStats {
  totalMembers: number;
  membersByProject: number; // average
  byRole: { [roleName: string]: number };
  roleChanges: number; // history count
}

export interface FundingStats {
  fundersPerProject: number; // average
  byFunder: { [funderName: string]: number }; // total amounts
  totalFunded: number;
  fundedPercentage: number; // %
}

// ==================== FORMS & DATA COLLECTION ====================

export interface FormStats {
  total: number;
  byModule: { [moduleName: string]: number };
  activeCount: number;
  lastUpdatedDate: string;
}

export interface DataSubmissionStats {
  totalSubmissions: number;
  byForm: { [formName: string]: number };
  byUser: { [userName: string]: number };
  byStatus: {
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
  submissionRatePerDay: number;
  avgTimePerFormMinutes: number;
}

export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  avgApprovalTimeHours: number;
  byApprover: { [approverName: string]: number };
}

export interface DataQualityStats {
  completenessRate: number; // %
  validationErrorCount: number;
  requiredFieldsMissing: number;
  failedSubmissions: number;
}

// ==================== ADMINISTRATIVE ====================

export interface LocalityStats {
  total: number;
  byLevel: { [levelName: string]: number };
  avgCoverage: number; // km2 or similar
  hierarchyDepth: number;
  utmZoneDistribution: { [zone: string]: number };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  last7DaysLogin: number;
  inactive30Days: number;
  byStatus: {
    active: number;
    inactive: number;
    suspended: number;
  };
}

export interface RoleStats {
  totalRoles: number;
  usersPerRole: { [roleName: string]: number };
  permissionsPerRole: { [roleName: string]: number };
  moduleAccess: { [moduleName: string]: number }; // count of users
}

export interface AuthorizationStats {
  moduleAccess: { [moduleName: string]: number };
  permissionMatrix: { [role: string]: string[] };
  lastModifiedDate: string;
}

// ==================== DATA QUALITY & COMPLIANCE ====================

export interface DataQualityIndicators {
  completeness: number; // %
  validationPassRate: number; // %
  spatialConflicts: number;
  duplicates: number;
  missingNida: number;
  geometryIssues: number;
  qualityScore: number; // aggregate 0-100
}

export interface ComplianceStats {
  auditTrailCompleteness: number; // %
  userRoleAdherence: number; // %
  approvalChainCompliance: number; // %
  documentRetentionMonths: number;
  accessLogRetentionMonths: number;
  complianceScore: number; // aggregate 0-100
}

// ==================== CROSS-DOMAIN METRICS ====================

export interface GeographicCoverage {
  totalLocalitiesCovered: number;
  landAreaUnderManagement: number; // sqm
  cadastralCoverage: number; // %
  registrationRate: number; // %
  ccroissuanceRate: number; // %
  dataLastUpdated: string;
}

export interface TenureSecurityMetrics {
  rightsRegistered: number;
  activeTenureRights: number;
  partiesWithCertificates: number;
  nidaVerificationRate: number; // %
  certificateExpiryTracking: number;
  disputeConflictCases: number;
}

export interface OperationalEfficiency {
  avgProcessingDays: {
    subdivision: number;
    parcelRegistration: number;
    ccroIssuance: number;
    formSubmission: number;
  };
  userProductivity: {
    parcelsSurveyorMonth: number;
    applicationsOfficerMonth: number;
    formsCollectorDay: number;
  };
  systemUptime: number; // %
}

export interface FinancialTracking {
  projectBudgetTotal: number;
  allocatedVsSpent: number; // percentage
  byOrganization: { [orgName: string]: number };
  byLocality: { [localityName: string]: number };
  byFunder: { [funderName: string]: number };
  costPerParcelRegistered: number;
}

export interface GeographicDistribution {
  parcelsByLocality: { [localityName: string]: number };
  ccroByDistrict: { [districtName: string]: number };
  coverageGaps: string[]; // locality names
  highActivityAreas: string[];
  unregisteredAreas: number;
  landUseDistribution: { [zoneName: string]: number };
}

export interface TemporalTrends {
  parcelCreatedTrend: { [period: string]: number }; // monthly
  ccroIssuedTrend: { [period: string]: number };
  applicationsSubmittedTrend: { [period: string]: number };
  formsCompletedTrend: { [period: string]: number };
  userActivityTrend: { [period: string]: number };
  systemGrowthYoY: number; // %
}

// ==================== MASTER DASHBOARD ====================

export interface GRIIDashboardData {
  // Executive Summary
  summary: {
    totalParcelsRegistered: number;
    ccrosIssuedThisMonth: number;
    nidaVerificationRate: number;
    dataCurrentness: string; // e.g., "Last updated 2 hours ago"
    activeUsers: number;
  };

  // Main Metrics
  subdivision: SubdivisionStats;
  parcel: ParcelStats;
  photo: PhotoStats;
  surveyorPerformance: SurveyorPerformance[];

  ccro: CCROStats;
  nida: NidaStats;
  party: PartyStats;
  allocation: AllocationStats;
  tenureRight: TenureRightStats;
  certificate: CertificateStats;
  ccroOfficerPerformance: CCROOfficerPerformance[];

  zoning: ZoningStats;
  zone: ZoneStats;

  project: ProjectStats;
  projectTimeline: ProjectTimeline;
  team: TeamStats;
  funding: FundingStats;

  form: FormStats;
  dataSubmission: DataSubmissionStats;
  approval: ApprovalStats;
  dataFormQuality: DataQualityStats;

  locality: LocalityStats;
  user: UserStats;
  role: RoleStats;
  authorization: AuthorizationStats;

  // Quality & Compliance
  dataQuality: DataQualityIndicators;
  compliance: ComplianceStats;

  // Cross-Domain
  coverage: GeographicCoverage;
  tenureSecurity: TenureSecurityMetrics;
  efficiency: OperationalEfficiency;
  financial: FinancialTracking;
  distribution: GeographicDistribution;
  trends: TemporalTrends;

  // Metadata
  lastUpdated: string;
  dataCurrentness: string; // human-readable
  refreshInterval: number; // seconds

  // Geospatial Data for Map
  mapData: {
    parcels: Array<{
      id: string;
      coordinates: string | any; // GeoJSON or string
      status: string;
    }>;
    projects: Array<{
      id: string;
      name: string;
      coordinates?: string; // If projects have location
      status: string;
    }>;
  };
}

export interface DashboardFilterOptions {
  locality?: number;
  module?: string;
  dateRange?: {
    from: string; // ISO date
    to: string;
  };
  user?: number;
  status?: string;
  customDateRange?: boolean;
}

export interface DashboardAlert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  metric: string;
  value: number | string;
  threshold?: number;
  timestamp: string;
}

export interface DashboardExportOptions {
  format: 'pdf' | 'csv' | 'xlsx' | 'geojson';
  sections?: string[]; // which sections to include
  includeCharts: boolean;
  includeMetadata: boolean;
}

export interface DashboardView {
  id: string;
  name: string;
  description?: string;
  filters: DashboardFilterOptions;
  pinnedMetrics: string[];
  lastAccessed: string;
  isDefault: boolean;
}
