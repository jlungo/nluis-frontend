import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useZoneDetailQuery = (id?: string | number) =>
  useQuery({
    queryKey: ["zone", id],
    enabled: !!id,
    queryFn: () => api.get(`/zoning/zones/${id}/`).then((r) => r.data),
  });

export const useUpdateZoneStatus = (opts?: { onDone?: () => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) =>
      api.patch(`/zoning/zones/${id}/`, { status }).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["zone", vars.id] });
      qc.invalidateQueries({ queryKey: ["zones-tiles"] });
      opts?.onDone?.();
    },
  });
};
