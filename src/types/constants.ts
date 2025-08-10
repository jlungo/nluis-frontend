export type userTypeProps = "Staff" | "Planner" | "Officer" | "Stakeholder";
export type genderTypeProps = "Male" | "Female";

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
