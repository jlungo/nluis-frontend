import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { APIResponse } from "@/types/api-response";

export interface LevelProps {
  slug: string;
  name: string;
  module_slug: string;
  module_name: string;
}

interface DataProps extends APIResponse {
  results: LevelProps[];
}

export const levelQueryKey = "levelKey";

export const useLevelsQuery = (
  limit: number,
  offset: number,
  keyword: string,
  module: string
) => {
  return useQuery<DataProps>({
    queryKey: [levelQueryKey, { limit, offset, keyword, module }],
    queryFn: () =>
      api
        .get(
          `/form-management/module/levels/?limit=${limit}&offset=${offset}&keyword=${keyword}&module=${module}`
        )
        .then((res) => res.data),
  });
};
