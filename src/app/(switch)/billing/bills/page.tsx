import { useLayoutEffect, useState } from "react";
import { usePageStore } from "@/store/pageStore";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { useBillsQuery, type BillDto } from "@/queries/useBillsQuery";
import { Badge } from "@/components/ui/badge";

export default function BillsPage() {
  const { setPage } = usePageStore();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    setPage({
      module: "billing",
      title: "Bills",
    });
  }, [setPage]);

  const { data, isLoading, isError } = useBillsQuery({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const bills = data?.results ?? [];

  const columns: ColumnDef<BillDto>[] = [
    {
      accessorKey: "id",
      header: "Bill #",
      cell: ({ row }) => <span className="font-mono">#{row.original.id}</span>,
    },
    {
      accessorKey: "holder_name",
      header: "Holder",
    },
    {
      accessorKey: "holder_phone",
      header: "Phone",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const b = row.original;
        const amount = b.total_amount ?? b.amount ?? "0.00";
        return (
          <span className="font-mono text-sm">
            {amount} {b.currency_code || ""}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "issued_date",
      header: "Issued",
      cell: ({ row }) => new Date(row.original.issued_date).toLocaleString(),
    },
    {
      accessorKey: "expiry_date",
      header: "Expiry",
      cell: ({ row }) => new Date(row.original.expiry_date).toLocaleString(),
    },
    {
      accessorKey: "control_number",
      header: "Control #",
      cell: ({ row }) => row.original.control_number || "-",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl 2xl:text-2xl font-semibold">Bills</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Bills generated for orders and other charges, used for customer payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search bills..."
            className="h-9 w-full md:w-1/2 rounded-md border border-input bg-background px-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label
              className="text-sm text-muted-foreground"
              htmlFor="bill-status-filter"
            >
              Status
            </label>
            <select
              id="bill-status-filter"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {isError && (
        <div className="text-sm text-red-600">
          Failed to load bills. Please try again.
        </div>
      )}

      <DataTable<BillDto, unknown>
        columns={columns}
        data={bills}
        isLoading={isLoading}
        enableGlobalFilter={false}
        showRowNumbers
        emptyText="No bills yet."
      />
    </div>
  );
}
