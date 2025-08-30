export type userTypeProps = "Staff" | "Planner" | "Officer" | "Stakeholder";
export type genderTypeProps = "Male" | "Female";
export type workflowCategoryTypeProps =
  | "registration"
  | "assessment"
  | "approval"
  | "monitoring"
  | "reporting"
  | "workflow";

export const userTypes: Record<number, userTypeProps> = {
  1: "Staff",
  2: "Planner",
  3: "Officer",
  4: "Stakeholder",
};

export const genderTypes: Record<number, genderTypeProps> = {
  1: "Male",
  2: "Female",
};

export const workflowCategoryTypes: Record<number, workflowCategoryTypeProps> =
  {
    1: "registration",
    2: "assessment",
    3: "approval",
    4: "monitoring",
    5: "reporting",
    6: "workflow",
  };

export type WorkflowCategoryKey = keyof typeof workflowCategoryTypes;

export const LOCALITY_LEVELS = {
  NATIONAL: "1",
  ZONAL: "2",
  REGION: "3",
  DISTRICT: "4",
  WARD: "5",
  VILLAGE: "6",
} as const;

export const LOCALITY_LEVEL_NAMES = {
  [LOCALITY_LEVELS.NATIONAL]: "National",
  [LOCALITY_LEVELS.ZONAL]: "Zonal",
  [LOCALITY_LEVELS.REGION]: "Regional",
  [LOCALITY_LEVELS.DISTRICT]: "District",
  [LOCALITY_LEVELS.WARD]: "Ward",
  [LOCALITY_LEVELS.VILLAGE]: "Village",
} as const;

export const ProjectStatus: Record<number, string> = {
  1: "Pending",
  2: "In Process",
  3: "Completed",
  4: "On Hold",
};

export const ProjectApprovalStatus: Record<number, string> = {
  1: "Waiting for Approval",
  2: "Approved",
  3: "Rejected",
};

export const ProjectStatusFilters: Record<string, string> = {
  all: "All Statuses",
  draft: "Draft",
  "in-progress": "In Progress",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};