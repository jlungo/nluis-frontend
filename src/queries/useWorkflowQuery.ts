import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { APIResponse } from "@/types/api-response";

export interface WorkflowProps {
  slug: string;
  name: string;
  description: string;
  version: string;
  is_active: boolean;
  module_workflow_slug: string;
  module_workflow_name: string;
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
  level: string,
  is_active: string
) => {
  return useQuery<DataProps>({
    queryKey: [
      workflowQueryKey,
      { limit, offset, keyword, module, level, is_active },
    ],
    queryFn: () =>
      api
        .get(
          `/form-management/workflows/?limit=${limit}&offset=${offset}&keyword=${keyword}&module=${module}&level=${level}&is_active=${is_active}`
        )
        .then((res) => res.data),
  });
};
