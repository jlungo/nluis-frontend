import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { PaginatedResponseI } from "@/types/pagination";

export interface OrderDto {
  id: number;
  customer_name: string;
  billing_name: string | null;
  total_amount: string | null; // Decimal
  currency: number;
  currency_code?: string;
  status: string;
  created_at: string;
  items_count: number;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const ordersQueryKey = "orders";

export const useOrdersQuery = (filters?: OrderFilters) => {
  return useQuery<PaginatedResponseI<OrderDto>>({
    queryKey: [ordersQueryKey, filters],
    queryFn: async () => {
      const res = await api.get<PaginatedResponseI<OrderDto>>("/sales/orders/", {
        params: filters,
      });
      return res.data;
    },
  });
};
