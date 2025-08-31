import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { InputType } from "@/types/input-types";

export interface formDataI {
  form_slug: string;
  value: string;
  type: InputType;
  name: string;
  field_id: number;
  project_id: string;
  approved: boolean;
}

export const formDataQueryKey = "formDataKey";

export const useFormDataQuery = (
  workflow_slug: string,
  project_slug: string
) => {
  return useQuery({
    queryKey: [formDataQueryKey, { workflow_slug, project_slug }],
    queryFn: () =>
      api
        .get(
          `/form-management/form-data/?workflow_id=${workflow_slug}&project_id=${project_slug}`
        )
        .then((res) => res.data),
  });
};
