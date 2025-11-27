import { useLocalityProjectsCheckQuery } from '@/queries/useLocalityProjectsCheckQuery';

interface UseWorkflowAccessCheckProps {
  locality_id: string;
  moduleLevel: string;
}

interface UseWorkflowAccessCheckResult {
  canAccess: boolean;
  isLoading: boolean;
  reason?: string;
}

// Land use levels that require land use projects
// Pattern: *-land-use-* (includes M&E and Compliance variants)
const LAND_USE_LEVEL_PATTERN = /-land-use-/;

// CCRO levels that require CCRO projects
// Pattern: ccro-projects-* (includes M&E and Compliance variants)
const CCRO_LEVEL_PATTERN = /ccro-projects-/;

/**
 * Hook to check if workflow can be accessed for a locality in a specific module level
 * 
 * Land use levels (any level with -land-use- pattern): require land use project
 * CCRO levels (any level with ccro-projects- pattern): require CCRO project
 */
export const useWorkflowAccessCheck = ({
  locality_id,
  moduleLevel,
}: UseWorkflowAccessCheckProps): UseWorkflowAccessCheckResult => {
  const { data: projectsCheck, isLoading } = useLocalityProjectsCheckQuery(locality_id);

  if (isLoading) {
    return {
      canAccess: false,
      isLoading: true,
    };
  }

  if (!projectsCheck) {
    return {
      canAccess: false,
      isLoading: false,
      reason: 'Unable to verify project requirements',
    };
  }

  // Check for land use levels
  if (LAND_USE_LEVEL_PATTERN.test(moduleLevel)) {
    const canAccess = projectsCheck.has_land_use_project;
    return {
      canAccess,
      isLoading: false,
      reason: canAccess ? undefined : 'This locality must have a land use project to access workflows',
    };
  }

  // Check for CCRO levels
  if (CCRO_LEVEL_PATTERN.test(moduleLevel)) {
    const canAccess = projectsCheck.has_ccro_project;
    return {
      canAccess,
      isLoading: false,
      reason: canAccess ? undefined : 'This locality must have a CCRO project to access workflows',
    };
  }

  return {
    canAccess: false,
    isLoading: false,
    reason: 'Unknown module level',
  };
};
