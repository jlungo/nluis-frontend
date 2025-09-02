import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { InputType } from "@/types/input-types";

export interface formDataI {
  field_id: number;
  form_slug: string;
  value: string;
  type: InputType;
  approved: boolean;
}

export const response: formDataI[] = [
  {
    field_id: 12,
    form_slug: "inception_details",
    value: "Adolph Alfred",
    type: "text",
    approved: false,
  },
  {
    field_id: 13,
    form_slug: "inception_details",
    value: "adolfalfred321@gmail.com",
    type: "email",
    approved: false,
  },
  {
    field_id: 14,
    form_slug: "inception_details",
    value: "http://backendurl.api/resources/adolf-alfred-avatar.jpg",
    type: "file",
    approved: false,
  },
];

export const formDataQueryKey = "formDataKey";

export const useFormDataQuery = (
  workflow_slug: string,
  project_slug: string
) => {
  return useQuery<formDataI[]>({
    queryKey: [formDataQueryKey, { workflow_slug, project_slug }],
    queryFn: () =>
      api
        .get(
          `/form-management/form-data/?workflow_slug=${workflow_slug}&project_id=${project_slug}`
        )
        // .then((res) => res.data),
        .then(() => response),
  });
};
