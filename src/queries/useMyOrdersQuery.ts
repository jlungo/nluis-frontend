import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { PaginatedResponseI } from "@/types/pagination";
import type { OrderDto, OrderFilters } from "@/queries/useOrdersQuery";

export const myOrdersQueryKey = "my-orders";

export const useMyOrdersQuery = (filters?: OrderFilters) => {
  return useQuery<PaginatedResponseI<OrderDto>>({
    queryKey: [myOrdersQueryKey, filters],
    queryFn: async () => {
      const res = await api.get<PaginatedResponseI<OrderDto>>("/sales/orders/my/", {
        params: filters,
      });
      return res.data;
    },
  });
};
