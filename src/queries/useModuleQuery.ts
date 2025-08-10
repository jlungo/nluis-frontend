import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface ModuleProps {
  id: string;
  name: string;
}

export const moduleQueryKey = "module";

export const useModulesQuery = () => {
  return useQuery({
    queryKey: [moduleQueryKey],
    queryFn: () => api.get(`/module`).then((res) => res.data),
  });
};
