import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { PaginatedResponseI } from "@/types/pagination";

export interface SaleProductDto {
  id: number;
  name: string;
  description?: string | null;
  base_price: string; // DRF DecimalField serialized as string
  is_active: boolean;
  currency: number | null;
  fee: number | null;
  content_type: string;
  object_id: number;
  currency_code?: string;
  currency_name?: string;
  fee_name?: string | null;
  target_label?: string | null;
}

export interface SaleProductFilters {
  search?: string;
  is_active?: "1" | "0";
  limit?: number;
  offset?: number;
}

export const saleProductsQueryKey = "sale-products";

export const useSaleProductsQuery = (filters?: SaleProductFilters) => {
  return useQuery<PaginatedResponseI<SaleProductDto>>({
    queryKey: [saleProductsQueryKey, filters],
    queryFn: async () => {
      const res = await api.get<PaginatedResponseI<SaleProductDto>>(
        "/sales/products/",
        { params: filters }
      );
      return res.data;
    },
  });
};
