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
