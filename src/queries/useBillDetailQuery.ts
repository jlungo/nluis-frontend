import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { BillDto } from "@/queries/useBillsQuery";

export const billDetailQueryKey = "bill-detail";

export const useBillDetailQuery = (id: number | undefined) => {
  return useQuery<BillDto | null>({
    queryKey: [billDetailQueryKey, id],
    enabled: typeof id === "number" && !Number.isNaN(id),
    queryFn: async () => {
      if (typeof id !== "number" || Number.isNaN(id)) return null;
      const res = await api.get<BillDto>(`/billing/bills/${id}`);
      return res.data;
    },
    refetchInterval: (query) => {
      const bill = query.state.data;
      if (!bill) return false;
      return bill.status === "Pending" ? 5000 : false;
    },
  });
};
