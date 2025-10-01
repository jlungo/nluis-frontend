import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export type LandUseDto = {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null; // legacy fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any; // { layers: [...] }
};

const landUsesKey = ["setup", "land-uses"];

export const useLandUsesQuery = () =>
  useQuery<LandUseDto[]>({
    queryKey: landUsesKey,
    queryFn: async () => {
      const res = await api.get("/setup/land-uses");
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
