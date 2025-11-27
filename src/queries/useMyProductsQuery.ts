import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { PaginatedResponseI } from "@/types/pagination";

export interface MyPurchasedProductDto {
  id: number;
  product_id: number;
  product_name: string;
  target_label?: string | null;
  thumbnail_url?: string | null;
  currency_code?: string;
  base_price: string;
  order_id: number;
  order_status: string;
  bill_id: number | null;
  purchased_at: string;
}

export interface MyProductsFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

export const myProductsQueryKey = "my-products";

export const useMyProductsQuery = (filters?: MyProductsFilters) => {
  return useQuery<PaginatedResponseI<MyPurchasedProductDto>>({
    queryKey: [myProductsQueryKey, filters],
    queryFn: async () => {
      const res = await api.get<PaginatedResponseI<MyPurchasedProductDto>>("/sales/my/products/", {
        params: filters,
      });
      return res.data;
    },
  });
};
