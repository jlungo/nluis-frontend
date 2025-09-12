export type userTypeProps = "Staff" | "Planner" | "Officer" | "Stakeholder";
export type genderTypeProps = "Male" | "Female";
export type userStatusProps = "Active" | "Inactive";
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

export const userStatus: Record<number, userStatusProps> = {
  0: "Inactive",
  1: "Active",
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

// TODO: Oversee these, they are dynamic from database.
export const LOCALITY_LEVELS = {
  NATIONAL: "4",
  ZONAL: "NULL",
  REGION: "2",
  DISTRICT: "5",
  WARD: "6",
  VILLAGE: "7",
} as const;

export const LOCALITY_LEVEL_NAMES = {
  [LOCALITY_LEVELS.NATIONAL]: "National",
  [LOCALITY_LEVELS.ZONAL]: "Zonal",
  [LOCALITY_LEVELS.REGION]: "Regional",
  [LOCALITY_LEVELS.DISTRICT]: "District",
  [LOCALITY_LEVELS.WARD]: "Ward",
  [LOCALITY_LEVELS.VILLAGE]: "Village",
} as const;

export const MODULE_LEVEL_SLUG = {
  [LOCALITY_LEVELS.NATIONAL]: "national-land-use",
  [LOCALITY_LEVELS.ZONAL]: "zonal-land-use",
  [LOCALITY_LEVELS.REGION]: "regional-land-use",
  [LOCALITY_LEVELS.DISTRICT]: "district-land-use",
  [LOCALITY_LEVELS.WARD]: "ward-land-use",
  [LOCALITY_LEVELS.VILLAGE]: "village-land-use",
} as const;

export const ProjectStatus: Record<number, string> = {
  1: "Pending",
  2: "In Process",
  3: "Completed",
  4: "On Hold",
};

export const ProjectApprovalStatus: Record<number, string> = {
  1: "Waiting Approval",
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

export const ProjectStatusColors: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  "In Process": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  Completed:
    "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  "On Hold":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  "Waiting for Approval":
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  Approved: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
};

export const tanzaniaLocalityKey = 92;

export const Specializations: Record<number, string> = {
  1: "PRA",
  2: "GIS",
  3: "PLUM",
  4: "Survey",
  5: "Communications Officer",
  6: "Other",
};
