import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

interface CreateOrderFromProductPayload {
  product_id: number;
  quantity?: number;
}

export interface CreateOrderFromProductResponse {
  order_id: number;
  bill_id: number | null;
  bill_control_number: string | null;
  amount: string | null;
  currency: string | null;
  status: string;
}

export const useCreateOrderFromProductMutation = () => {
  return useMutation<CreateOrderFromProductResponse, unknown, CreateOrderFromProductPayload>({
    mutationFn: async (payload) => {
      const res = await api.post<CreateOrderFromProductResponse>(
        "/sales/orders/from-product/",
        payload
      );
      return res.data;
    },
  });
};
