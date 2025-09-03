export function canCreateProject(role: string) {
    return role === "Admin" || role === "Project Leader"
}

export function canEditProject(role: string, approval_status: number) {
    return (role === "Admin" || role === "Project Leader") && approval_status !== 2
}

export function canDeleteProject(role: string, approval_status: number) {
    return (role === "Admin" || role === "Project Leader" || role === "Dg") && approval_status !== 2
}

export function canApproveProject(role: string, approval_status: number) {
    return (role === "Admin" || role === "Dg") && approval_status !== 2
}