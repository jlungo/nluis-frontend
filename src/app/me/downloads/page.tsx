import { useLayoutEffect, useState } from "react";
import { usePageStore } from "@/store/pageStore";
import { useMyProductsQuery, type MyPurchasedProductDto } from "@/queries/useMyProductsQuery";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MyProductsPage() {
  const { setPage } = usePageStore();
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    setPage({
      module: "me",
      title: "My Products",
    });
  }, [setPage]);

  const { data, isLoading, isError } = useMyProductsQuery({
    search: search || undefined,
  });

  const products = data?.results ?? [];

  const columns: ColumnDef<MyPurchasedProductDto>[] = [
    {
      accessorKey: "product_name",
      header: "Product",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-medium text-sm">{row.original.product_name}</div>
          {row.original.target_label && (
            <div className="text-xs text-muted-foreground">{row.original.target_label}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "base_price",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.currency_code ?? ""} {row.original.base_price}
        </span>
      ),
    },
    {
      accessorKey: "order_status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.original.order_status}
        </Badge>
      ),
    },
    {
      accessorKey: "purchased_at",
      header: "Purchased",
      cell: ({ row }) => new Date(row.original.purchased_at).toLocaleString(),
    },
    {
      id: "actions",
      header: "Download",
      cell: () => (
        <Button variant="outline" size="sm" disabled>
          Download
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl 2xl:text-2xl font-semibold">My Products</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Products you have purchased from the MapShop and their available downloads.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search my products..."
          className="h-9 w-full md:w-1/2 rounded-md border border-input bg-background px-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isError && (
        <div className="text-sm text-red-600">
          Failed to load your products. Please try again.
        </div>
      )}

      <DataTable<MyPurchasedProductDto, unknown>
        columns={columns}
        data={products}
        isLoading={isLoading}
        enableGlobalFilter={false}
        showRowNumbers
        emptyText="You have no purchased products yet."
      />
    </div>
  );
}
