import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface ModuleProps {
  slug: string;
  name: string;
}

export const moduleQueryKey = "module";

export const useModulesQuery = () => {
  return useQuery<ModuleProps[]>({
    queryKey: [moduleQueryKey],
    queryFn: () => api.get(`/auth/modules`).then((res) => res.data),
  });
};
