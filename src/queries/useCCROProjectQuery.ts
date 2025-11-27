import {
  useProjectsQuery as useSharedProjectsQuery,
  useProjectQuery as useSharedProjectQuery,
  useCreateProject as useSharedCreateProject,
  useUpdateProject as useSharedUpdateProject,
  useDeleteProject as useSharedDeleteProject,
  useFunders as useSharedFunders,
  queryProjectKey as sharedQueryProjectKey,
} from './useProjectQuery';

// Re-export the shared hooks under CCRO names for clarity in the ccro module.
export const useCCROProjectsQuery = useSharedProjectsQuery;
export const useCCROProjectQuery = useSharedProjectQuery;
export const useCreateCCROProject = useSharedCreateProject;
export const useUpdateCCROProject = useSharedUpdateProject;
export const useDeleteCCROProject = useSharedDeleteProject;
export const useCCROFunders = useSharedFunders;
export const queryCCROProjectKey = sharedQueryProjectKey;

// Note: these wrappers do not change behavior — they are thin aliases so the CCRO
// module imports clearly named hooks (maintainability) while reusing existing endpoints.
