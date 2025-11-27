import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface FeeDto {
  id: number;
  name: string;
  gfs_code: string;
  payment_option: string | null;
  price: string; // decimal as string
}

export const feesQueryKey = "billing-fees";

export const useFeesQuery = () => {
  return useQuery<FeeDto[]>({
    queryKey: [feesQueryKey],
    queryFn: async () => {
      const res = await api.get<FeeDto[]>("/billing/fees");
      return res.data ?? [];
    },
  });
};
