import { useLayoutEffect, useState } from "react";
import { usePageStore } from "@/store/pageStore";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { useOrdersQuery, type OrderDto } from "@/queries/useOrdersQuery";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
  const { setPage } = usePageStore();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    setPage({
      module: "billing",
      title: "Orders",
    });
  }, [setPage]);

  const { data, isLoading, isError } = useOrdersQuery({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const orders = data?.results ?? [];

  const columns: ColumnDef<OrderDto>[] = [
    {
      accessorKey: "id",
      header: "Order #",
      cell: ({ row }) => <span className="font-mono">#{row.original.id}</span>,
    },
    {
      accessorKey: "customer_name",
      header: "Customer",
    },
    {
      accessorKey: "billing_name",
      header: "Billing name",
      cell: ({ row }) => row.original.billing_name || "-",
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => {
        const o = row.original;
        return (
          <span className="font-mono text-sm">
            {o.total_amount ?? "0.00"} {o.currency_code || ""}
          </span>
        );
      },
    },
    {
      accessorKey: "items_count",
      header: "Items",
      cell: ({ row }) => row.original.items_count ?? 0,
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
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl 2xl:text-2xl font-semibold">Orders</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Orders created from MapShop purchases, used to generate bills and payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search orders..."
            className="h-9 w-full md:w-1/2 rounded-md border border-input bg-background px-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label
              className="text-sm text-muted-foreground"
              htmlFor="order-status-filter"
            >
              Status
            </label>
            <select
              id="order-status-filter"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Draft">Draft</option>
              <option value="PendingBill">Pending bill</option>
              <option value="PendingPayment">Pending payment</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Fulfilled">Fulfilled</option>
            </select>
          </div>
        </div>
      </div>

      {isError && (
        <div className="text-sm text-red-600">
          Failed to load orders. Please try again.
        </div>
      )}

      <DataTable<OrderDto, unknown>
        columns={columns}
        data={orders}
        isLoading={isLoading}
        enableGlobalFilter={false}
        showRowNumbers
        emptyText="No orders yet."
      />
    </div>
  );
}
