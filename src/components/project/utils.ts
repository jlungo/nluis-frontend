import type { ProjectI } from "@/types/projects";

export function approvalStatus(localities?: ProjectI["localities"]) {
  return localities && localities.length > 0
    ? localities.every((loc) => loc.approval_status === 2)
      ? 2
      : localities.every((loc) => loc.approval_status === 3)
      ? 3
      : 1
    : 1;
}

export function approvalStatusAtleastOne(localities?: ProjectI["localities"]) {
  return localities && localities.length > 0
    ? localities.some((loc) => loc.approval_status === 2)
      ? 2
      : localities.some((loc) => loc.approval_status === 3)
      ? 3
      : 1
    : 1;
}
