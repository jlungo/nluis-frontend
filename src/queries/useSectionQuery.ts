import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { APIResponse } from "@/types/api-response";

export interface SectionProps {
  slug: string;
  name: string;
  position?: number;
  level_slug: string;
  level_name: string;
  module_slug: string;
  module_name: string;
}

interface DataProps extends APIResponse {
  results: SectionProps[];
}

export const sectionQueryKey = "sectionKey";

export const useSectionsQuery = (
  limit: number,
  offset: number,
  keyword: string,
  module: string,
  level: string
) => {
  return useQuery<DataProps>({
    queryKey: [sectionQueryKey, { limit, offset, keyword, module, level }],
    queryFn: () =>
      api
        .get(
          `/form-management/sections/?limit=${limit}&offset=${offset}&keyword=${keyword}&module=${module}&level=${level}`
        )
        .then((res) => res.data),
  });
};
