import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { PaginatedResponseI } from "@/types/pagination";

export interface PaymentDto {
  id: number;
  bill_id: number | null;
  bill_control_number: string | null;
  transaction_id: string;
  currency: string;
  sp_code: string;
  payment_ref: string;
  payer_name: string | null;
  payer_email: string | null;
  payer_mobile_number: string | null;
  control_number: string;
  payment_channel: string;
  paid_amount: string | null;
  receipt_number: string;
  psp_name: string;
  date_paid: string;
}

export interface PaymentFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

export const paymentsQueryKey = "payments";

export const usePaymentsQuery = (filters?: PaymentFilters) => {
  return useQuery<PaginatedResponseI<PaymentDto>>({
    queryKey: [paymentsQueryKey, filters],
    queryFn: async () => {
      const res = await api.get<PaginatedResponseI<PaymentDto>>("/billing/payments", {
        params: filters,
      });
      return res.data;
    },
  });
};
