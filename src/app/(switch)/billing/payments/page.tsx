import { useLayoutEffect, useState } from "react";
import { usePageStore } from "@/store/pageStore";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { usePaymentsQuery, type PaymentDto } from "@/queries/usePaymentsQuery";
import { Badge } from "@/components/ui/badge";

export default function PaymentsPage() {
  const { setPage } = usePageStore();
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    setPage({
      module: "billing",
      title: "Payments",
    });
  }, [setPage]);

  const { data, isLoading, isError } = usePaymentsQuery({
    search: search || undefined,
  });

  const payments = data?.results ?? [];

  const columns: ColumnDef<PaymentDto>[] = [
    {
      accessorKey: "transaction_id",
      header: "Transaction #",
      cell: ({ row }) => (
        <span className="font-mono text-xs md:text-sm">
          {row.original.transaction_id}
        </span>
      ),
    },
    {
      accessorKey: "bill_control_number",
      header: "Bill / Control #",
      cell: ({ row }) => row.original.bill_control_number || row.original.control_number,
    },
    {
      accessorKey: "payer_name",
      header: "Payer",
      cell: ({ row }) => row.original.payer_name || "-",
    },
    {
      accessorKey: "payer_mobile_number",
      header: "Phone",
      cell: ({ row }) => row.original.payer_mobile_number || "-",
    },
    {
      accessorKey: "paid_amount",
      header: "Amount",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <span className="font-mono text-sm">
            {p.paid_amount ?? "0.00"} {p.currency}
          </span>
        );
      },
    },
    {
      accessorKey: "payment_channel",
      header: "Channel",
    },
    {
      accessorKey: "psp_name",
      header: "PSP",
    },
    {
      accessorKey: "date_paid",
      header: "Date paid",
      cell: ({ row }) => new Date(row.original.date_paid).toLocaleString(),
    },
    {
      accessorKey: "receipt_number",
      header: "Receipt #",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-mono">
          {row.original.receipt_number}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl 2xl:text-2xl font-semibold">Payments</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Payments received for bills, including amounts, channels, and receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search payments (transaction, control no, payer)..."
            className="h-9 w-full md:w-1/2 rounded-md border border-input bg-background px-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isError && (
        <div className="text-sm text-red-600">
          Failed to load payments. Please try again.
        </div>
      )}

      <DataTable<PaymentDto, unknown>
        columns={columns}
        data={payments}
        isLoading={isLoading}
        enableGlobalFilter={false}
        showRowNumbers
        emptyText="No payments yet."
      />
    </div>
  );
}
