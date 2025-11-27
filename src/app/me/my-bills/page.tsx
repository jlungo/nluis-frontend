import { useLayoutEffect, useState } from "react";
import { usePageStore } from "@/store/pageStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { PaginatedResponseI } from "@/types/pagination";
import type { BillDto } from "@/queries/useBillsQuery";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export default function MyBillsPage() {
  const { setPage } = usePageStore();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    setPage({ module: "me", title: "My Bills" });
  }, [setPage]);

  const { data, isLoading, isError } = useQuery<PaginatedResponseI<BillDto>>({
    queryKey: ["my-bills", { status: statusFilter, search }],
    queryFn: async () => {
      const res = await api.get<PaginatedResponseI<BillDto>>("/billing/my/bills", {
        params: {
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });
      return res.data;
    },
  });

  const bills = data?.results ?? [];

  const columns: ColumnDef<BillDto>[] = [
    {
      accessorKey: "id",
      header: "Bill #",
      cell: ({ row }) => <span className="font-mono">#{row.original.id}</span>,
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
          <h1 className="text-xl 2xl:text-2xl font-semibold">My Bills</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Bills generated for your MapShop purchases and other charges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search my bills..."
            className="h-9 w-full md:w-1/2 rounded-md border border-input bg-background px-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label
              className="text-sm text-muted-foreground"
              htmlFor="my-bill-status-filter"
            >
              Status
            </label>
            <select
              id="my-bill-status-filter"
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
          Failed to load your bills. Please try again.
        </div>
      )}

      <DataTable<BillDto, unknown>
        columns={columns}
        data={bills}
        isLoading={isLoading}
        enableGlobalFilter={false}
        showRowNumbers
        emptyText="You have no bills yet."
      />
    </div>
  );
}
