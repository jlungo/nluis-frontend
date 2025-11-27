import { useLayoutEffect, useState } from "react";
import { usePageStore } from "@/store/pageStore";
import { useSaleProductsQuery, saleProductsQueryKey } from "@/queries/useSalesProductsQuery";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { SaleProductDto } from "@/queries/useSalesProductsQuery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SalesAddItemDialog } from "./SalesAddItemDialog";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { useFeesQuery } from "@/queries/useFeesQuery";

export default function SalesAdminPage() {
  const { setPage } = usePageStore();
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    setPage({
      module: "billing",
      title: "Sales Management",
    });
  }, [setPage]);

  const [statusFilter, setStatusFilter] = useState<"all" | "1" | "0">("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<SaleProductDto | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const { data: fees = [], isLoading: feesLoading } = useFeesQuery();

  const { data, isLoading, isError } = useSaleProductsQuery({
    is_active: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
  });

  const products = data?.results ?? [];

  const columns: ColumnDef<SaleProductDto>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-medium">{row.original.name}</div>
          {row.original.target_label && (
            <div className="text-xs text-muted-foreground">
              {row.original.target_label}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "content_type",
      header: "Type",
      cell: ({ row }) => {
        const raw = row.original.content_type;
        if (!raw) return "-";
        if (raw === "plandocument") return "Plan document";
        return raw.charAt(0).toUpperCase() + raw.slice(1);
      },
    },
    {
      accessorKey: "base_price",
      header: "Price",
      cell: ({ row }) => {
        const p = row.original;
        const amount = p.base_price;
        const code = p.currency_code ?? "";
        return (
          <div className="font-mono text-sm">
            {amount} {code}
          </div>
        );
      },
    },
    {
      accessorKey: "fee_name",
      header: "Fee",
      cell: ({ row }) => row.original.fee_name ?? "-",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.is_active ? "default" : "secondary"}
          className={row.original.is_active ? "bg-green-600 text-white" : "bg-muted"}
        >
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl 2xl:text-2xl font-semibold">Sales Products</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage products that can be sold in the MapShop (plan documents, shapefiles, etc).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
              Add sale item
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search products..."
            className="h-9 w-full md:w-1/2 rounded-md border border-input bg-background px-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label
              className="text-sm text-muted-foreground"
              htmlFor="status-filter"
            >
              Status
            </label>
            <select
              id="status-filter"
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "1" | "0")
              }
            >
              <option value="all">All</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {isError && (
        <div className="text-sm text-red-600">
          Failed to load sales products. Please try again.
        </div>
      )}

      <DataTable<SaleProductDto, unknown>
        columns={columns}
        data={products}
        isLoading={isLoading}
        enableGlobalFilter={false}
        showRowNumbers
        rowActions={(product) => (
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setEditing(product)}
              aria-label="Edit sale item"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive"
              onClick={async () => {
                if (!window.confirm(`Delete sale item "${product.name}"?`)) {
                  return;
                }
                try {
                  await api.delete(`/sales/products/${product.id}/`);
                  toast.success("Sale item deleted");
                  await queryClient.invalidateQueries({ queryKey: [saleProductsQueryKey] });
                } catch (e: any) {
                  console.error("Failed to delete sale item", e);
                  const msg = e?.response?.data?.detail || "Failed to delete sale item";
                  toast.error(msg);
                }
              }}
              aria-label="Delete sale item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        emptyText="No sales products configured yet."
      />

      <SalesAddItemDialog open={addOpen} onOpenChange={setAddOpen} />

      {/* Edit dialog */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit sale item</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium" htmlFor="edit-name">
                  Name
                </label>
                <Input
                  id="edit-name"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label
                  className="text-xs font-medium"
                  htmlFor="edit-description"
                >
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  rows={3}
                  value={editing.description ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium" htmlFor="edit-price">
                  Base price
                </label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editing.base_price}
                  onChange={(e) =>
                    setEditing({ ...editing, base_price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium" htmlFor="edit-fee">
                  Billing fee
                </label>
                <select
                  id="edit-fee"
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                  value={editing.fee ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      fee: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  disabled={feesLoading}
                >
                  <option value="">Select fee...</option>
                  {fees.map((fee) => (
                    <option key={fee.id} value={fee.id}>
                      {fee.name} ({fee.price})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="edit-active"
                  checked={editing.is_active}
                  onCheckedChange={(v) =>
                    setEditing({ ...editing, is_active: Boolean(v) })
                  }
                />
                <label htmlFor="edit-active" className="text-xs">
                  Active
                </label>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditing(null)}
              disabled={editSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={editSaving || !editing}
              onClick={async () => {
                if (!editing) return;
                try {
                  setEditSaving(true);
                  await api.patch(`/sales/products/${editing.id}/`, {
                    name: editing.name,
                    description: editing.description ?? null,
                    base_price: editing.base_price,
                    is_active: editing.is_active,
                    fee: editing.fee,
                  });
                  toast.success("Sale item updated");
                  setEditing(null);
                  await queryClient.invalidateQueries({ queryKey: [saleProductsQueryKey] });
                } catch (e: any) {
                  console.error("Failed to update sale item", e);
                  const msg = e?.response?.data?.detail || "Failed to update sale item";
                  toast.error(msg);
                } finally {
                  setEditSaving(false);
                }
              }}
            >
              {editSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
