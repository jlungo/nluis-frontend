import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { APIResponse } from "@/types/api-response";

interface DataProps extends APIResponse {
  results: [];
}

export const formDataQueryKey = "formDataKey";

export const useFormDataQuery = (
  limit: number,
  offset: number,
  formSlug: string
) => {
  return useQuery<DataProps>({
    queryKey: [formDataQueryKey, { limit, offset, formSlug }],
    queryFn: () =>
      api
        .get(
          `/form-management/form-data/?limit=${limit}&offset=${offset}&form_slug=${formSlug}`
        )
        .then((res) => res.data),
  });
};
