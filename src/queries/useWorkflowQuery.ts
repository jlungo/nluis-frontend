import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { APIResponse } from "@/types/api-response";

export interface WorkflowProps {
  slug: string;
  name: string;
  category: number;
  description: string;
  version: string;
  is_active: boolean;
  module_level_slug: string;
  module_level_name: string;
  module_slug: string;
  module_name: string;
  sections_count: number;
}

interface DataProps extends APIResponse {
  results: WorkflowProps[];
}

export const workflowQueryKey = "workflowKey";

export const useWorkflowsQuery = (
  limit: number,
  offset: number,
  keyword: string,
  module: string,
  level: string
) => {
  return useQuery<DataProps>({
    queryKey: [workflowQueryKey, { limit, offset, keyword, module, level }],
    queryFn: () =>
      api
        .get(
          `/form-management/workflows/?limit=${limit}&offset=${offset}&keyword=${keyword}&module=${module}&module_level=${level}`
        )
        .then((res) => res.data),
  });
};

export const useWorkflowQuery = (workflow_slug: string) => {
  return useQuery({
    queryKey: [workflowQueryKey, { workflow_slug }],
    queryFn: () =>
      api
        .get(`/form-management/submission/${workflow_slug}/`)
        .then((res) => res.data),
  });
};
