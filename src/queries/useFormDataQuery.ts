import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { InputType } from "@/types/input-types";

export interface formDataI {
  field_id: number;
  form_slug: string;
  value: string;
  type: InputType;
  is_approved: boolean;
}

export const formDataQueryKey = "formDataKey";

export const useFormDataQuery = (
  workflow_slug?: string,
  project_locality_id?: string
) => {
  return useQuery<formDataI[]>({
    queryKey: [formDataQueryKey, { workflow_slug, project_locality_id }],
    queryFn: () =>
      api
        .get(
          `/form-management/data/?workflow_slug=${workflow_slug}&project_locality_id=${project_locality_id}`
        )
        .then((res) => res.data),
    enabled: workflow_slug !== undefined && project_locality_id !== undefined,
  });
};
