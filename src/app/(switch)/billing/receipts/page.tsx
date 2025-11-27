import { useLayoutEffect, useState } from "react";
import { usePageStore } from "@/store/pageStore";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { usePaymentsQuery, type PaymentDto } from "@/queries/usePaymentsQuery";
import { Badge } from "@/components/ui/badge";

export default function ReceiptsPage() {
  const { setPage } = usePageStore();
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    setPage({
      module: "billing",
      title: "Receipts",
    });
  }, [setPage]);

  const { data, isLoading, isError } = usePaymentsQuery({
    search: search || undefined,
  });

  const receipts = data?.results ?? [];

  const columns: ColumnDef<PaymentDto>[] = [
    {
      accessorKey: "receipt_number",
      header: "Receipt #",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-mono">
          {row.original.receipt_number}
        </Badge>
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
        const r = row.original;
        return (
          <span className="font-mono text-sm">
            {r.paid_amount ?? "0.00"} {r.currency}
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
      accessorKey: "transaction_id",
      header: "Transaction #",
      cell: ({ row }) => (
        <span className="font-mono text-xs md:text-sm">
          {row.original.transaction_id}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl 2xl:text-2xl font-semibold">Receipts</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Receipts issued for successful payments, including bill and transaction references.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search receipts (receipt #, bill, payer)..."
            className="h-9 w-full md:w-1/2 rounded-md border border-input bg-background px-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isError && (
        <div className="text-sm text-red-600">
          Failed to load receipts. Please try again.
        </div>
      )}

      <DataTable<PaymentDto, unknown>
        columns={columns}
        data={receipts}
        isLoading={isLoading}
        enableGlobalFilter={false}
        showRowNumbers
        emptyText="No receipts yet."
      />
    </div>
  );
}
