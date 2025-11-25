import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { PaginatedResponseI } from "@/types/pagination";

export interface BillDto {
  id: number;
  holder_name: string;
  holder_phone: string;
  holder_address: string;
  currency: number;
  currency_code?: string;
  status: string;
  amount: string | null;
  total_amount: string | null;
  issued_date: string;
  expiry_date: string;
  control_number: string | null;
}

export interface BillFilters {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const billsQueryKey = "bills";

export const useBillsQuery = (filters?: BillFilters) => {
  return useQuery<PaginatedResponseI<BillDto>>({
    queryKey: [billsQueryKey, filters],
    queryFn: async () => {
      const res = await api.get<PaginatedResponseI<BillDto>>("/billing/bills", {
        params: filters,
      });
      return res.data;
    },
  });
};
