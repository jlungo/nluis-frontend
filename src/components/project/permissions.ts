export function canCreateProject(userRole: string) {
  return userRole === "Admin" || userRole === "Project Leader";
}

export function canEditProject(
  userRole: string,
  projectApprovalStatus: number
) {
  return (
    (userRole === "Admin" || userRole === "Project Leader") &&
    projectApprovalStatus !== 2
  );
}

export function canDeleteProject(
  userRole: string,
  projectApprovalStatus: number
) {
  return (
    (userRole === "Admin" || userRole === "Project Leader") &&
    projectApprovalStatus !== 2
  );
}

export function canApproveProject(
  userRole: string,
  projectApprovalStatus: number
) {
  return (
    (userRole === "Admin" || userRole === "Dg") && projectApprovalStatus !== 2
  );
}
