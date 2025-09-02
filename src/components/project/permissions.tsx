import { useAuth } from "@/store/auth"

export function canCreateProject() {
    const { user } = useAuth()
    return user?.role?.name === "Admin" || user?.role?.name === "Project Leader"
}

export function canEditProject(approval_status: number) {
    const { user } = useAuth()
    return (user?.role?.name === "Admin" || user?.role?.name === "Project Leader") && approval_status !== 2
}

export function canApproveProject(approval_status: number) {
    const { user } = useAuth()
    return (user?.role?.name === "Admin" || user?.role?.name === "Dg") && approval_status !== 2
}