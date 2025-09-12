export function canCreateProject(userRole: string) {
  return (
    userRole === "Admin" ||
    userRole === "Project Leader" ||
    userRole === "Land Use Officer"
  );
}

export function canEditProject(
  userRole: string,
  projectApprovalStatus: number
) {
  return (
    (userRole === "Admin" ||
      userRole === "Project Leader" ||
      userRole === "Land Use Officer") &&
    projectApprovalStatus !== 2
  );
}

export function canDeleteProject(
  userRole: string,
  projectApprovalStatus: number
) {
  return (
    (userRole === "Admin" ||
      userRole === "Project Leader" ||
      userRole === "Land Use Officer") &&
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
